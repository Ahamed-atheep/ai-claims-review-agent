import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.db.database import Base


class ClaimStatus(str, Enum):
    """Mirror of the claim_status_enum PostgreSQL type."""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    FLAGGED_MANUAL_REVIEW = "FLAGGED_MANUAL_REVIEW"


class RiskLevel(str, Enum):
    """Mirror of the risk_level_enum PostgreSQL type."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RecommendedAction(str, Enum):
    """Mirror of the action_enum PostgreSQL type."""
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    ESCALATE_TO_INVESTIGATOR = "ESCALATE_TO_INVESTIGATOR"

    @property
    def api_value(self) -> str:
        if self is RecommendedAction.ESCALATE_TO_INVESTIGATOR:
            return "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
        return self.value


class Claim(Base):
    """ORM model for the claims table."""

    __tablename__ = "claims"

    claim_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_number = Column(String, nullable=False)
    policy_number = Column(String, nullable=False)
    claimant_name = Column(String, nullable=False)
    claim_type = Column(String, nullable=False)
    claimed_amount = Column(Float, nullable=False)
    status = Column(
        SQLEnum(ClaimStatus, name="claim_status_enum", create_type=False),
        nullable=True,
        default=ClaimStatus.PENDING,
    )
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class ClaimDocument(Base):
    """ORM model for the claim_documents table."""

    __tablename__ = "claim_documents"

    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), nullable=False)
    file_name = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    page_count = Column(Integer, nullable=True, default=1)
    raw_ocr_text = Column(Text, nullable=True)
    exif_metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AgentAnalysisRow(Base):
    """ORM model for the agent_analyses table."""

    __tablename__ = "agent_analyses"

    analysis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), nullable=False)
    agent_name = Column(String, nullable=False)
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(
        SQLEnum(RiskLevel, name="risk_level_enum", create_type=False),
        nullable=False,
    )
    findings = Column(JSONB, nullable=False)
    execution_time_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SynthesisReportRow(Base):
    """ORM model for the synthesis_reports table."""

    __tablename__ = "synthesis_reports"

    report_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), nullable=False)
    overall_risk_score = Column(Integer, nullable=True)
    overall_risk_level = Column(
        SQLEnum(RiskLevel, name="risk_level_enum", create_type=False),
        nullable=False,
    )
    recommended_action = Column(
        SQLEnum(
            RecommendedAction,
            name="action_enum",
            create_type=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    executive_summary = Column(Text, nullable=False)
    red_flags = Column(JSONB, nullable=False)
    investigator_questions = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
