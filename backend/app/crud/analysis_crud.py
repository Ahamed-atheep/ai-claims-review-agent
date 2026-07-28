"""
app/crud/analysis_crud.py

Raw database operations for agent_analyses and synthesis_reports.
No business logic — that belongs in AnalysisService.
"""
from __future__ import annotations

import uuid
from uuid import UUID

from sqlalchemy import select
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


async def insert_agent_analysis(
    db: AsyncSession,
    *,
    claim_id: str,
    agent_name: str,
    risk_score: int | None,
    risk_level: str | RiskLevel,
    findings: dict,
    execution_time_ms: int,
) -> AgentAnalysisRow:
    """INSERT one agent_analyses row and flush (caller owns the transaction)."""
    row = AgentAnalysisRow(
        analysis_id=uuid.uuid4(),
        claim_id=_uuid(claim_id),
        agent_name=agent_name,
        risk_score=risk_score,
        risk_level=_to_risk_level(risk_level),
        findings=findings,
        execution_time_ms=execution_time_ms,
    )
    db.add(row)
    await db.flush()
    return row


async def insert_synthesis_report(
    db: AsyncSession,
    *,
    claim_id: str,
    overall_risk_score: int,
    overall_risk_level: str | RiskLevel,
    recommended_action: str | RecommendedAction,
    executive_summary: str,
    red_flags: list[str],
    investigator_questions: list[str],
) -> SynthesisReportRow:
    """INSERT one synthesis_reports row and flush (caller owns the transaction)."""
    row = SynthesisReportRow(
        report_id=uuid.uuid4(),
        claim_id=_uuid(claim_id),
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
