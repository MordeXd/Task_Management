import secrets
import string
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def utcnow():
    return datetime.now(timezone.utc)


def oid(value: str | ObjectId | None) -> ObjectId | None:
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return value
    return ObjectId(str(value))


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if not doc:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def generate_temp_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for _ in range(length))
