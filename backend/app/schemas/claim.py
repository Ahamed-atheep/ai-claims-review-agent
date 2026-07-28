"""
app/schemas/claim.py

Pydantic models for the Claims Management API.
"""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.db.models import ClaimStatus

# ── Enum mirror (matches claim_status_enum in Supabase) ──────────────────────

# ── Request models ────────────────────────────────────────────────────────────

class CreateClaimRequest(BaseModel):
    claim_number: str = Field(..., min_length=1, max_length=100)
    policy_number: str = Field(..., min_length=1, max_length=100)
    claimant_name: str = Field(..., min_length=1, max_length=255)
    claim_type: str = Field(..., min_length=1, max_length=100)
    claimed_amount: float = Field(..., gt=0, description="Must be greater than 0")

    @field_validator("claim_number", "policy_number", "claimant_name", "claim_type", mode="before")
    @classmethod
    def strip_and_reject_blank(cls, v: object) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("Field must be a non-empty string.")
        return v.strip()


class UpdateClaimRequest(BaseModel):
    claimant_name: str | None = Field(None, min_length=1, max_length=255)
    claim_type: str | None = Field(None, min_length=1, max_length=100)
    claimed_amount: float | None = Field(None, gt=0)
    status: ClaimStatus | None = None

    @field_validator("claimant_name", "claim_type", mode="before")
    @classmethod
    def strip_if_present(cls, v: object) -> str | None:
        if v is None:
            return None
        if not isinstance(v, str) or not v.strip():
            raise ValueError("Field must be a non-empty string.")
        return v.strip()

    def has_updates(self) -> bool:
        return any(
            v is not None
            for v in (self.claimant_name, self.claim_type, self.claimed_amount, self.status)
        )


# ── Document metadata (no OCR text) ──────────────────────────────────────────

class DocumentMeta(BaseModel):
    document_id: str
    file_name: str
    mime_type: str
    page_count: int | None
    created_at: datetime | None

    model_config = {"from_attributes": True}


# ── Response models ───────────────────────────────────────────────────────────

class ClaimResponse(BaseModel):
    claim_id: str
    claim_number: str
    policy_number: str
    claimant_name: str
    claim_type: str
    claimed_amount: float
    status: ClaimStatus
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class ClaimDetailResponse(ClaimResponse):
    """Claim + all linked document metadata (no OCR text)."""
    documents: list[DocumentMeta] = Field(default_factory=list)


class CreateClaimResponse(BaseModel):
    success: bool
    claim_id: str
    claim_number: str
    status: ClaimStatus
    message: str


class UpdateClaimResponse(BaseModel):
    success: bool
    claim_id: str
    status: ClaimStatus
    message: str


class DeleteClaimResponse(BaseModel):
    success: bool
    claim_id: str
    message: str


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int


class ClaimListResponse(BaseModel):
    items: list[ClaimResponse]
    pagination: PaginationMeta
