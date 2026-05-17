import logging
import os

import requests

from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def send_email(self, to: str, subject: str, body: str):
  api_key = os.getenv("BREVO_API_KEY", "")
  try:
    if api_key:
      resp = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={"api-key": api_key, "Content-Type": "application/json"},
        json={
          "sender": {"name": "TaskFlow", "email": os.getenv("BREVO_SENDER_EMAIL", "noreply@taskflow.local")},
          "to": [{"email": to}],
          "subject": subject,
          "textContent": body,
        },
        timeout=30,
      )
      resp.raise_for_status()
      logger.info("Email sent to %s: %s", to, subject)
    else:
      logger.info("[EMAIL SIMULATION] To: %s | Subject: %s\n%s", to, subject, body)
    return {"to": to, "subject": subject, "status": "sent"}
  except Exception:
    logger.exception("Failed to send email to %s: %s", to, subject)
    raise
