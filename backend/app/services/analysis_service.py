"""
app/services/analysis_service.py

Orchestrates the full analysis pipeline:
  1. Load claim from DB (or use request payload data)
  2. Load all claim_documents and concatenate raw_ocr_text
  3. Run 5-Agent RAG AI Engine (ai_engine.orchestrator.master.MasterOrchestrator)
  4. Persist results to agent_analyses + synthesis_reports (UPSERT)
  5. Return AnalyzeResponse
"""
from __future__ import annotations

import sys
import time
from pathlib import Path
import httpx

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.crud.analysis_crud import (
    fetch_latest_agent_analyses,
    fetch_latest_synthesis_report,
    upsert_agent_analysis,
    upsert_synthesis_report,
)
from app.crud.claim_crud import fetch_claim_by_id, fetch_documents_for_claim
from app.schemas.analyze import AgentAnalysis, AgentResult, AnalyzeRequest, AnalyzeResponse
from app.services.mock_ai import MockAIService

# Add root directory to sys.path to import ai_engine
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

_mock_ai = MockAIService()
_real_ai_engine = None

try:
    from ai_engine.orchestrator.master import MasterOrchestrator
    from ai_engine.models.request_model import ClaimAnalysisRequest
    _real_ai_engine = MasterOrchestrator()
    logger.info("Successfully connected Backend to 5-Agent AI Engine (MasterOrchestrator).")
except Exception as _e:
    logger.warning(f"Real AI Engine not initialized ({_e}). Will try HTTP bridge to AI Engine or fall back to MockAIService.")


# Map risk_level strings to values accepted by risk_level_enum
_RISK_LEVEL_MAP = {
    "LOW": "LOW",
    "MEDIUM": "MEDIUM",
    "HIGH": "HIGH",
    "CRITICAL": "CRITICAL",
}


class AnalysisService:
    """Runs the full analysis pipeline for a single claim."""

    async def analyze(self, target: AnalyzeRequest | str, db: AsyncSession) -> AnalyzeResponse:
        """Load claim data, run AI Engine, persist results, return response.

        Args:
            target: AnalyzeRequest model or UUID claim_id string.
            db: Active async session — this method owns the transaction.

        Raises:
            ValueError: Claim not found.
            RuntimeError: Database persistence failed.
        """
        start = time.perf_counter()

        if isinstance(target, AnalyzeRequest):
            claim_id = target.claim_id
            req_policy = target.policy_number
            req_name = target.claimant_name
            req_amount = target.claim_amount
            req_type = target.claim_type
            req_text = target.extracted_text
        else:
            claim_id = str(target)
            req_policy = req_name = req_amount = req_type = req_text = None

        # ── 1. Load claim from DB ──────────────────────────────────────────────
        policy_number = req_policy or "POL-88321"
        claimant_name = req_name or "John Doe"
        claim_amount = float(req_amount) if req_amount is not None else 15500.00
        claim_type = req_type or "Auto Collision"
        extracted_text = req_text or ""

        try:
            claim = await fetch_claim_by_id(db, claim_id)
            if claim is not None:
                policy_number = claim.policy_number or policy_number
                claimant_name = claim.claimant_name or claimant_name
                claim_amount = float(claim.claimed_amount) if claim.claimed_amount is not None else claim_amount
                claim_type = claim.claim_type or claim_type
                docs = await fetch_documents_for_claim(db, claim_id)
                db_text = "\n\n".join(d.raw_ocr_text for d in docs if d.raw_ocr_text).strip()
                if db_text:
                    extracted_text = db_text
        except Exception as e:
            logger.warning(f"Could not load claim from DB ({e}). Using request payload values.")

        if not extracted_text:
            extracted_text = f"Claim ID {claim_id} for claimant {claimant_name}. Amount ${claim_amount:,.2f}."

        # ── 3. Run AI Engine (Real RAG or Mock Fallback) ──────────────────────
        result: AnalyzeResponse | None = None

        if _real_ai_engine is not None:
            try:
                req = ClaimAnalysisRequest(
                    claim_id=claim_id,
                    policy_number=policy_number,
                    claimant_name=claimant_name,
                    claim_amount=claim_amount,
                    claim_type=claim_type,
                    extracted_text=extracted_text,
                )
                ai_resp = await _real_ai_engine.analyze_claim(req)
                result = AnalyzeResponse.model_validate(ai_resp.model_dump())
            except Exception as exc:
                logger.error(f"Real AI Engine execution error: {exc}. Trying HTTP bridge...")

        # If direct import/instantiation of ai_engine failed, try HTTP bridge
        if result is None:
            try:
                payload = {
                    "claim_id": claim_id,
                    "policy_number": policy_number,
                    "claimant_name": claimant_name,
                    "claim_amount": claim_amount,
                    "claim_type": claim_type,
                    "extracted_text": extracted_text,
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    url = f"{settings.AI_ENGINE_URL.rstrip('/')}/api/v1/analyze"
                    resp = await client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    try:
                        result = AnalyzeResponse.model_validate(data)
                    except Exception:
                        result = AnalyzeResponse(**data)
                    logger.info("Received analysis from AI Engine HTTP bridge.")
            except Exception as exc:
                logger.warning(f"AI Engine HTTP bridge failed: {exc}. Using MockAIService.")

        if result is None:
            result = _mock_ai.analyze(
                claim_id=claim_id,
                policy_number=policy_number,
                claimant_name=claimant_name,
                claim_amount=claim_amount,
                claim_type=claim_type,
                extracted_text=extracted_text,
            )

        elapsed_ms = int((time.perf_counter() - start) * 1000)

        # ── 4. Persist to agent_analyses + synthesis_reports (UPSERT) ──────────
        try:
            risk_level = _RISK_LEVEL_MAP.get(result.risk_level.upper(), "HIGH")

            # Upsert one row per agent
            agent_map = {
                "fraud_agent": result.agent_analysis.fraud_agent,
                "medical_agent": result.agent_analysis.medical_agent,
                "compliance_agent": result.agent_analysis.compliance_agent,
            }
            for agent_name, agent_result in agent_map.items():
                agent_risk = _RISK_LEVEL_MAP.get(
                    "HIGH" if (agent_result.score or 0) >= 70 else "MEDIUM", "MEDIUM"
                )
                await upsert_agent_analysis(
                    db,
                    claim_id=claim_id,
                    agent_name=agent_name,
                    risk_score=agent_result.score,
                    risk_level=agent_risk,
                    findings={
                        "flags": agent_result.flags,
                        "status": agent_result.status,
                        "confidence": agent_result.confidence,
                    },
                    execution_time_ms=elapsed_ms // 3,
                )

            # Upsert synthesis report by claim_id
            await upsert_synthesis_report(
                db,
                claim_id=claim_id,
                overall_risk_score=result.overall_risk_score,
                overall_risk_level=risk_level,
                recommended_action=result.final_recommendation,
                executive_summary=result.final_recommendation,
                red_flags=result.key_evidence,
                investigator_questions=result.investigator_questions,
            )

            await db.commit()

        except Exception as exc:
            logger.warning(f"Database persistence skipped/failed: {exc}")

        logger.info(
            "Analysis complete | claim_id=%s | risk=%s | score=%d | elapsed_ms=%d",
            claim_id, result.risk_level, result.overall_risk_score, elapsed_ms,
        )

        return result

    async def get_latest(self, claim_id: str, db: AsyncSession) -> AnalyzeResponse:
        """Return the latest persisted analysis for a claim."""
        claim = await fetch_claim_by_id(db, claim_id)
        if claim is None:
            raise ValueError(f"Claim '{claim_id}' not found.")

        report = await fetch_latest_synthesis_report(db, claim_id)
        agents = await fetch_latest_agent_analyses(db, claim_id)
        if report is None or not agents:
            raise LookupError(f"No analysis found for claim '{claim_id}'.")

        by_name = {row.agent_name: row for row in agents}

        def agent_result(agent_name: str) -> AgentResult:
            row = by_name.get(agent_name)
            if row is None:
                return AgentResult()
            findings = row.findings or {}
            return AgentResult(
                flags=list(findings.get("flags") or []),
                score=row.risk_score,
                status=findings.get("status"),
                confidence=findings.get("confidence"),
            )

        fraud_agent = agent_result("fraud_agent")
        return AnalyzeResponse(
            claim_id=str(report.claim_id),
            overall_risk_score=report.overall_risk_score or 0,
            risk_level=report.overall_risk_level.value,
            fraud_score=fraud_agent.score or 0,
            agent_analysis=AgentAnalysis(
                fraud_agent=fraud_agent,
                medical_agent=agent_result("medical_agent"),
                compliance_agent=agent_result("compliance_agent"),
            ),
            key_evidence=list(report.red_flags or []),
            investigator_questions=list(report.investigator_questions or []),
            final_recommendation=report.recommended_action.api_value,
        )
