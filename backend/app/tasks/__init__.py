from app.tasks.celery_app import celery
from app.tasks import email_tasks  # noqa: F401

__all__ = ["celery", "email_tasks"]
