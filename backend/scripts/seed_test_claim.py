"""Seed a test claim and one document into the backend database.

Run from repo root:
  python backend/scripts/seed_test_claim.py

This script reads DB config from backend/.env (loaded by app.core.config.Settings).
"""
import asyncio
import os
import sys
from decimal import Decimal

# Ensure backend package imports resolve when running script from repo root
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.db.database import SessionLocal
from app.db.models import Claim, ClaimDocument


async def seed():
    async with SessionLocal() as session:
        async with session.begin():
            claim = Claim(
                claim_number="TEST-CLAIM-001",
                policy_number="POL-TEST-001",
                claimant_name="Jane Tester",
                claim_type="Auto Collision",
                claimed_amount=Decimal("12345.67"),
            )
            session.add(claim)
            await session.flush()

            doc = ClaimDocument(
                claim_id=claim.claim_id,
                file_name="test_claim_doc.pdf",
                storage_path="uploads/test_claim_doc.pdf",
                mime_type="application/pdf",
                raw_ocr_text=(
                    "Claimant reports loss after single-vehicle collision. "
                    "Invoice timestamp appears earlier than incident date."
                ),
            )
            session.add(doc)

        # commit happens via context manager
        print("Inserted test claim:", str(claim.claim_id))


if __name__ == "__main__":
    try:
        asyncio.run(seed())
    except Exception as e:
        print("Seeding failed:", e)
        raise
