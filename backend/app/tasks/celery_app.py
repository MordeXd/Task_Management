import os

from celery import Celery

celery = Celery(
  "taskflow",
  broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
  backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)
celery.conf.update(
  task_serializer="json",
  accept_content=["json"],
  result_serializer="json",
  timezone="UTC",
  enable_utc=True,
  task_always_eager=os.getenv("CELERY_TASK_ALWAYS_EAGER", "true").lower() == "true",
  task_eager_propagates=True,
)
