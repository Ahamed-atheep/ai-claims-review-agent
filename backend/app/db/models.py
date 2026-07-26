from sqlalchemy import Column, DateTime, Float, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Claim(Base):
    """Placeholder ORM model for a submitted claim."""

    __tablename__ = "claims"

    claim_id = Column(String, primary_key=True, index=True)
    policy_number = Column(String, nullable=False)
    claimant_name = Column(String, nullable=False)
    claim_amount = Column(Float, nullable=False)
    claim_type = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
