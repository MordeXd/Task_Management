import re
from datetime import datetime

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
URL_RE = re.compile(r"^https?://\S+")
ISO_DATE_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$"
)
ALLOWED_PRIORITIES = {"low", "medium", "high"}
PASSWORD_MIN_LENGTH = 8
PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}[\]|~`]).+$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))


def validate_url(url: str) -> bool:
    return bool(URL_RE.match(url))


def validate_date(date_str: str) -> bool:
    if not date_str:
        return True
    try:
        datetime.fromisoformat(date_str)
        return True
    except (ValueError, TypeError):
        return False


def validate_priority(value: str) -> bool:
    return value in ALLOWED_PRIORITIES


def validate_string_length(value: str, min_len: int = 1, max_len: int = 1000) -> bool:
    return min_len <= len(value) <= max_len


def validate_password(password: str) -> str | None:
    if len(password) < PASSWORD_MIN_LENGTH:
        return "Password must be at least 8 characters"
    if not PASSWORD_RE.match(password):
        return "Password must include uppercase, lowercase, digit, and special character"
    return None


def validate_object_ids(ids: list) -> bool:
    from bson import ObjectId

    for uid in ids:
        try:
            ObjectId(str(uid))
        except Exception:
            return False
    return True
