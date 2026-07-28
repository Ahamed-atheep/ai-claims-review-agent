"""
app/crud/claim_crud.py

Raw database operations for the claims table.
No business logic — that belongs in ClaimService.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Claim, ClaimDocument, ClaimStatus


# ── Typed result for list queries ────────────────────────────────────────────

@dataclass
class ClaimPage:
    items: list[Claim]
    total: int
    page: int
    page_size: int


def _uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def _claim_status(value: str | ClaimStatus | None) -> ClaimStatus | None:
    if value is None or isinstance(value, ClaimStatus):
        return value
    return ClaimStatus(value)


# ── Write operations ──────────────────────────────────────────────────────────

async def insert_claim(
    db: AsyncSession,
    *,
    claim_number: str,
    policy_number: str,
    claimant_name: str,
    claim_type: str,
    claimed_amount: float,
    created_by: str | None = None,
) -> Claim:
    """INSERT a new claim row and return the refreshed ORM object.

    Raises:
        IntegrityError: claim_number already exists (UNIQUE violation).
    """
    claim = Claim(
        claim_number=claim_number,
        policy_number=policy_number,
        claimant_name=claimant_name,
        claim_type=claim_type,
        claimed_amount=claimed_amount,
        status=ClaimStatus.PENDING,
        created_by=_uuid(created_by) if created_by is not None else None,
    )
    db.add(claim)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise
    await db.refresh(claim)
    return claim


async def fetch_claim_by_id(db: AsyncSession, claim_id: str) -> Claim | None:
    """SELECT a single claim by UUID. Returns None if not found."""
    result = await db.execute(
        select(Claim).where(Claim.claim_id == _uuid(claim_id))
    )
    return result.scalar_one_or_none()


async def fetch_claim_by_number(db: AsyncSession, claim_number: str) -> Claim | None:
    """SELECT a single claim by claim_number. Returns None if not found."""
    result = await db.execute(
        select(Claim).where(Claim.claim_number == claim_number)
    )
    return result.scalar_one_or_none()


async def fetch_claims_page(
    db: AsyncSession,
    *,
    page: int,
    page_size: int,
    search: str | None,
    status: str | ClaimStatus | None,
    claim_type: str | None,
    sort_by: str,
    sort_order: str,
) -> ClaimPage:
    """SELECT a paginated, filtered, sorted page of claims.

    Args:
        page: 1-based page number.
        page_size: Rows per page (max 100).
        search: Substring match against claim_number, claimant_name, policy_number.
        status: Exact match against status enum.
        claim_type: Exact match against claim_type.
        sort_by: Column name to sort by (validated by caller).
        sort_order: 'asc' or 'desc'.
    """
    # Allowed sort columns — prevents SQL injection via column name
    _SORTABLE = {
        "created_at": Claim.created_at,
        "updated_at": Claim.updated_at,
        "claimed_amount": Claim.claimed_amount,
        "claimant_name": Claim.claimant_name,
        "claim_number": Claim.claim_number,
        "status": Claim.status,
    }
    sort_col = _SORTABLE.get(sort_by, Claim.created_at)
    order_expr = sort_col.desc() if sort_order == "desc" else sort_col.asc()

    base_q = select(Claim)

    if search:
        pattern = f"%{search}%"
        base_q = base_q.where(
            or_(
                Claim.claim_number.ilike(pattern),
                Claim.claimant_name.ilike(pattern),
                Claim.policy_number.ilike(pattern),
            )
        )
    if status:
        base_q = base_q.where(Claim.status == _claim_status(status))
    if claim_type:
        base_q = base_q.where(Claim.claim_type == claim_type)

    # Total count (same filters, no pagination)
    count_q = select(func.count()).select_from(base_q.subquery())
    total: int = (await db.execute(count_q)).scalar_one()

    # Paginated rows
    offset = (page - 1) * page_size
    rows_q = base_q.order_by(order_expr).offset(offset).limit(page_size)
    items = list((await db.execute(rows_q)).scalars().all())

    return ClaimPage(items=items, total=total, page=page, page_size=page_size)


async def fetch_documents_for_claim(
    db: AsyncSession, claim_id: str
) -> list[ClaimDocument]:
    """SELECT all claim_documents rows for a given claim_id."""
    result = await db.execute(
        select(ClaimDocument)
        .where(ClaimDocument.claim_id == _uuid(claim_id))
        .order_by(ClaimDocument.created_at.asc())
    )
    return list(result.scalars().all())


async def update_claim_fields(
    db: AsyncSession,
    claim: Claim,
    *,
    claimant_name: str | None,
    claim_type: str | None,
    claimed_amount: float | None,
    status: str | ClaimStatus | None,
) -> Claim:
    """UPDATE mutable fields on an existing Claim row.

    Only fields that are not None are applied.
    updated_at is always refreshed.
    """
    if claimant_name is not None:
        claim.claimant_name = claimant_name
    if claim_type is not None:
        claim.claim_type = claim_type
    if claimed_amount is not None:
        claim.claimed_amount = claimed_amount
    if status is not None:
        claim.status = _claim_status(status)

    claim.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(claim)
    return claim


async def delete_claim_by_id(db: AsyncSession, claim_id: str) -> list[str]:
    """DELETE a claim and return storage_paths of its documents for file cleanup.

    Child rows (claim_documents, agent_analyses, synthesis_reports) are removed
    by the database CASCADE constraint — no manual child deletion needed.
    """
    # Collect file paths before the cascade wipes them
    docs_result = await db.execute(
        select(ClaimDocument.storage_path).where(ClaimDocument.claim_id == _uuid(claim_id))
    )
    storage_paths = list(docs_result.scalars().all())

    await db.execute(delete(Claim).where(Claim.claim_id == _uuid(claim_id)))
    await db.flush()
    return storage_paths
