from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import get_db as _get_db

# Re-export for use in endpoint Depends()
def get_db() -> Generator[Session, None, None]:
    yield from _get_db()
