import uuid

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Claim(Base):
    """ORM model for the claims table."""

    __tablename__ = "claims"

    claim_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_number = Column(String, nullable=False)
    policy_number = Column(String, nullable=False)
    claimant_name = Column(String, nullable=False)
    claim_type = Column(String, nullable=False)
    claimed_amount = Column(Float, nullable=False)
    status = Column(String, nullable=True, default="PENDING")
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
