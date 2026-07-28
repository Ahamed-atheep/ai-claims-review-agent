import uuid


def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with an optional prefix."""
    uid = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{uid}" if prefix else uid
