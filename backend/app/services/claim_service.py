"""
app/services/claim_service.py

Business logic for Claims Management.
All database access goes through app/crud/claim_crud.py.
"""
from __future__ import annotations

import math
import os
import time

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.crud.claim_crud import (
    ClaimPage,
    delete_claim_by_id,
    fetch_claim_by_id,
    fetch_claim_by_number,
    fetch_claims_page,
    fetch_documents_for_claim,
    insert_claim,
    update_claim_fields,
)
from app.db.models import Claim, ClaimDocument
from app.schemas.claim import (
    ClaimDetailResponse,
    ClaimListResponse,
    ClaimResponse,
    CreateClaimRequest,
    DocumentMeta,
    PaginationMeta,
    UpdateClaimRequest,
)


class ClaimService:
    """Orchestrates all claim business logic."""

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def get_or_404(self, claim_id: str, db: AsyncSession) -> Claim:
        """Return Claim or raise ValueError (mapped to 404 by the endpoint)."""
        claim = await fetch_claim_by_id(db, claim_id)
        if claim is None:
            raise ValueError(f"Claim '{claim_id}' not found.")
        return claim

    async def claim_exists(self, claim_id: str, db: AsyncSession) -> bool:
        return await fetch_claim_by_id(db, claim_id) is not None

    # ── Create ────────────────────────────────────────────────────────────────

    async def create_claim(
        self, payload: CreateClaimRequest, db: AsyncSession
    ) -> Claim:
        """Create a new claim.

        Raises:
            ValueError: claim_number already exists.
        """
        start = time.perf_counter()

        # Guard duplicate claim_number before hitting the DB constraint
        existing = await fetch_claim_by_number(db, payload.claim_number)
        if existing is not None:
            raise ValueError(
                f"Claim number '{payload.claim_number}' already exists."
            )

        try:
            claim = await insert_claim(
                db,
                claim_number=payload.claim_number,
                policy_number=payload.policy_number,
                claimant_name=payload.claimant_name,
                claim_type=payload.claim_type,
                claimed_amount=payload.claimed_amount,
            )
            await db.commit()
        except IntegrityError:
            # Race condition: another request inserted the same claim_number
            await db.rollback()
            raise ValueError(
                f"Claim number '{payload.claim_number}' already exists."
            )

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "Claim created | claim_id=%s | claim_number=%s | elapsed_ms=%d",
            claim.claim_id, claim.claim_number, elapsed_ms,
        )
        return claim

    # ── Read single ───────────────────────────────────────────────────────────

    async def get_claim(
        self, claim_id: str, db: AsyncSession
    ) -> ClaimDetailResponse:
        """Return a claim with all its document metadata (no OCR text).

        Raises:
            ValueError: Claim not found.
        """
        claim = await self.get_or_404(claim_id, db)
        docs: list[ClaimDocument] = await fetch_documents_for_claim(db, claim_id)

        return ClaimDetailResponse(
            claim_id=str(claim.claim_id),
            claim_number=claim.claim_number,
            policy_number=claim.policy_number,
            claimant_name=claim.claimant_name,
            claim_type=claim.claim_type,
            claimed_amount=float(claim.claimed_amount),
            status=claim.status,
            created_at=claim.created_at,
            updated_at=claim.updated_at,
            documents=[
                DocumentMeta(
                    document_id=str(d.document_id),
                    file_name=d.file_name,
                    mime_type=d.mime_type,
                    page_count=d.page_count,
                    storage_path=d.storage_path,
                    created_at=d.created_at,
                )
                for d in docs
            ],
        )

    # ── List ──────────────────────────────────────────────────────────────────

    async def list_claims(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        search: str | None,
        status: str | None,
        claim_type: str | None,
        sort_by: str,
        sort_order: str,
    ) -> ClaimListResponse:
        """Return a paginated, filtered, sorted list of claims."""
        page_size = min(max(page_size, 1), 100)
        page = max(page, 1)

        result: ClaimPage = await fetch_claims_page(
            db,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            claim_type=claim_type,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        total_pages = max(math.ceil(result.total / page_size), 1)

        return ClaimListResponse(
            items=[
                ClaimResponse(
                    claim_id=str(c.claim_id),
                    claim_number=c.claim_number,
                    policy_number=c.policy_number,
                    claimant_name=c.claimant_name,
                    claim_type=c.claim_type,
                    claimed_amount=float(c.claimed_amount),
                    status=c.status,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                )
                for c in result.items
            ],
            pagination=PaginationMeta(
                total=result.total,
                page=result.page,
                page_size=result.page_size,
                total_pages=total_pages,
            ),
        )

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_claim(
        self, claim_id: str, payload: UpdateClaimRequest, db: AsyncSession
    ) -> Claim:
        """Update mutable fields on an existing claim.

        Raises:
            ValueError: Claim not found or no fields provided.
        """
        if not payload.has_updates():
            raise ValueError("No updatable fields provided.")

        claim = await self.get_or_404(claim_id, db)

        claim = await update_claim_fields(
            db,
            claim,
            claimant_name=payload.claimant_name,
            claim_type=payload.claim_type,
            claimed_amount=payload.claimed_amount,
            status=payload.status,
        )
        await db.commit()

        logger.info(
            "Claim updated | claim_id=%s | status=%s", claim_id, claim.status
        )
        return claim

    # ── Delete ────────────────────────────────────────────────────────────────

    async def delete_claim(self, claim_id: str, db: AsyncSession) -> None:
        """Delete a claim and clean up local storage files.

        Child rows are removed by DB CASCADE.
        Local PDF files are deleted best-effort.

        Raises:
            ValueError: Claim not found.
        """
        await self.get_or_404(claim_id, db)  # 404 guard

        storage_paths = await delete_claim_by_id(db, claim_id)
        await db.commit()

        # Best-effort local file cleanup
        deleted_files, failed_files = 0, 0
        for path in storage_paths:
            try:
                os.remove(path)
                deleted_files += 1
            except OSError:
                failed_files += 1

        logger.info(
            "Claim deleted | claim_id=%s | files_deleted=%d | files_missing=%d",
            claim_id, deleted_files, failed_files,
        )
