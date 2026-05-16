"""
Celery application for background tasks (email, notifications, etc.)
"""
from celery import Celery

# Create Celery app
celery_app = Celery(
    'taskflow',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)


@celery_app.task(name='app.tasks.send_email')
def send_email(to: str, subject: str, body: str):
    """
    Simulated email sending task
    In production, integrate with SendGrid, AWS SES, etc.
    """
    print(f"=== SENDING EMAIL ===")
    print(f"To: {to}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print(f"=======================")
    return {'status': 'sent', 'to': to}


@celery_app.task(name='app.tasks.send_password_reset_email')
def send_password_reset_email(to: str, reset_token: str):
    """Send password reset email"""
    reset_link = f"http://localhost:5173/reset-password/{reset_token}"
    body = f"""
    Hello,

    You requested a password reset. Click the link below to reset your password:
    {reset_link}

    This link expires in 30 minutes.

    If you didn't request this, please ignore this email.
    """
    send_email(to, "Password Reset Request", body)
    return {'status': 'sent', 'to': to}