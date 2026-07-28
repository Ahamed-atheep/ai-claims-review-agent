"""
app/services/analysis_service.py

Orchestrates the full analysis pipeline:
  1. Load claim from DB
  2. Load all claim_documents and concatenate raw_ocr_text
  3. Run MockAIService (later: real AI Engine)
  4. Persist results to agent_analyses + synthesis_reports (UPSERT)
  5. Return AnalyzeResponse
"""
from __future__ import annotations

import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.crud.analysis_crud import (
    fetch_latest_agent_analyses,
    fetch_latest_synthesis_report,
    upsert_agent_analysis,
    upsert_synthesis_report,
)
from app.crud.claim_crud import fetch_claim_by_id, fetch_documents_for_claim
from app.schemas.analyze import AgentAnalysis, AgentResult, AnalyzeResponse
from app.services.mock_ai import MockAIService

_mock_ai = MockAIService()

# Map MockAI risk_level strings to values accepted by risk_level_enum
_RISK_LEVEL_MAP = {
    "LOW": "LOW",
    "MEDIUM": "MEDIUM",
    "HIGH": "HIGH",
    "CRITICAL": "CRITICAL",
}


class AnalysisService:
    """Runs the full analysis pipeline for a single claim."""

    async def analyze(self, claim_id: str, db: AsyncSession) -> AnalyzeResponse:
        """Load claim data, run AI, persist results, return response.

        Args:
            claim_id: UUID string of the claim to analyse.
            db: Active async session — this method owns the transaction.

        Raises:
            ValueError: Claim not found.
            RuntimeError: Database persistence failed.
        """
        start = time.perf_counter()

        # ── 1. Load claim ─────────────────────────────────────────────────────
        claim = await fetch_claim_by_id(db, claim_id)
        if claim is None:
            raise ValueError(f"Claim '{claim_id}' not found.")

        # ── 2. Load documents and concatenate OCR text ────────────────────────
        docs = await fetch_documents_for_claim(db, claim_id)
        extracted_text = "\n\n".join(
            d.raw_ocr_text for d in docs if d.raw_ocr_text
        ).strip()

        # ── 3. Run MockAI ─────────────────────────────────────────────────────
        result: AnalyzeResponse = _mock_ai.analyze(
            claim_id=str(claim.claim_id),
            policy_number=claim.policy_number,
            claimant_name=claim.claimant_name,
            claim_amount=float(claim.claimed_amount),
            claim_type=claim.claim_type,
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
            await db.rollback()
            raise RuntimeError(
                f"Failed to persist analysis for claim '{claim_id}': {exc}"
            ) from exc

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
