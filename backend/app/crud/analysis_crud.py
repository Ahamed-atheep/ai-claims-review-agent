"""
app/crud/analysis_crud.py

Raw database operations for agent_analyses and synthesis_reports.
No business logic — that belongs in AnalysisService.
"""
from __future__ import annotations

import uuid
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AgentAnalysisRow,
    RecommendedAction,
    RiskLevel,
    SynthesisReportRow,
)


def _uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def _to_risk_level(value: str | RiskLevel) -> RiskLevel:
    """Coerce a string to RiskLevel enum, defaulting to HIGH on unknown values."""
    if isinstance(value, RiskLevel):
        return value
    try:
        return RiskLevel(value.upper())
    except ValueError:
        return RiskLevel.HIGH


def _to_recommended_action(value: str | RecommendedAction) -> RecommendedAction:
    """Coerce API/AI recommendation text to the action_enum mirror."""
    if isinstance(value, RecommendedAction):
        return value
    normalized = value.strip().upper()
    action_map = {
        "APPROVE": RecommendedAction.APPROVE,
        "REJECT": RecommendedAction.REJECT,
        "ESCALATE_TO_INVESTIGATOR": RecommendedAction.ESCALATE_TO_INVESTIGATOR,
        "REFER TO SPECIAL INVESTIGATION UNIT (SIU)": (
            RecommendedAction.ESCALATE_TO_INVESTIGATOR
        ),
    }
    try:
        return action_map[normalized]
    except KeyError as exc:
        raise ValueError(f"Unsupported recommended_action: {value!r}") from exc


async def upsert_agent_analysis(
    db: AsyncSession,
    *,
    claim_id: str | UUID,
    agent_name: str,
    risk_score: int | None,
    risk_level: str | RiskLevel,
    findings: dict,
    execution_time_ms: int,
) -> AgentAnalysisRow:
    """UPSERT an agent_analyses row for (claim_id, agent_name)."""
    claim_uuid = _uuid(claim_id)
    result = await db.execute(
        select(AgentAnalysisRow).where(
            AgentAnalysisRow.claim_id == claim_uuid,
            AgentAnalysisRow.agent_name == agent_name,
        )
    )
    existing = result.scalar_one_or_none()

    if existing is not None:
        existing.risk_score = risk_score
        existing.risk_level = _to_risk_level(risk_level)
        existing.findings = findings
        existing.execution_time_ms = execution_time_ms
        if hasattr(existing, "updated_at"):
            setattr(existing, "updated_at", func.now())
        await db.flush()
        return existing

    row = AgentAnalysisRow(
        analysis_id=uuid.uuid4(),
        claim_id=claim_uuid,
        agent_name=agent_name,
        risk_score=risk_score,
        risk_level=_to_risk_level(risk_level),
        findings=findings,
        execution_time_ms=execution_time_ms,
    )
    db.add(row)
    await db.flush()
    return row


# Backward-compatible alias
insert_agent_analysis = upsert_agent_analysis


async def upsert_synthesis_report(
    db: AsyncSession,
    *,
    claim_id: str | UUID,
    overall_risk_score: int,
    overall_risk_level: str | RiskLevel,
    recommended_action: str | RecommendedAction,
    executive_summary: str,
    red_flags: list[str],
    investigator_questions: list[str],
) -> SynthesisReportRow:
    """UPSERT a synthesis_reports row by claim_id (insert if new, update if existing)."""
    claim_uuid = _uuid(claim_id)
    result = await db.execute(
        select(SynthesisReportRow).where(SynthesisReportRow.claim_id == claim_uuid)
    )
    existing = result.scalar_one_or_none()

    if existing is not None:
        existing.overall_risk_score = overall_risk_score
        existing.overall_risk_level = _to_risk_level(overall_risk_level)
        existing.recommended_action = _to_recommended_action(recommended_action)
        existing.executive_summary = executive_summary
        existing.red_flags = red_flags
        existing.investigator_questions = investigator_questions
        if hasattr(existing, "updated_at"):
            setattr(existing, "updated_at", func.now())
        await db.flush()
        return existing

    row = SynthesisReportRow(
        report_id=uuid.uuid4(),
        claim_id=claim_uuid,
        overall_risk_score=overall_risk_score,
        overall_risk_level=_to_risk_level(overall_risk_level),
        recommended_action=_to_recommended_action(recommended_action),
        executive_summary=executive_summary,
        red_flags=red_flags,
        investigator_questions=investigator_questions,
    )
    db.add(row)
    await db.flush()
    return row


# Backward-compatible alias
insert_synthesis_report = upsert_synthesis_report


async def fetch_latest_synthesis_report(
    db: AsyncSession, claim_id: str | UUID
) -> SynthesisReportRow | None:
    """SELECT the newest synthesis report for a claim."""
    result = await db.execute(
        select(SynthesisReportRow)
        .where(SynthesisReportRow.claim_id == _uuid(claim_id))
        .order_by(SynthesisReportRow.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def fetch_latest_agent_analyses(
    db: AsyncSession, claim_id: str | UUID
) -> list[AgentAnalysisRow]:
    """SELECT the latest row for each agent for a claim."""
    result = await db.execute(
        select(AgentAnalysisRow)
        .where(AgentAnalysisRow.claim_id == _uuid(claim_id))
        .order_by(AgentAnalysisRow.created_at.desc())
    )
    latest_by_agent: dict[str, AgentAnalysisRow] = {}
    for row in result.scalars().all():
        latest_by_agent.setdefault(row.agent_name, row)
    return list(latest_by_agent.values())
