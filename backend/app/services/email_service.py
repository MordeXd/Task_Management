from app.config import Config


def send_password_reset_email(user: dict, reset_link: str):
  from app.tasks.email_tasks import send_email

  send_email.delay(
    user["email"],
    "Reset your TaskFlow password",
    f"Hi {user.get('name', '')},\n\nReset your password: {reset_link}\n\nLink expires in 30 minutes.",
  )


def send_welcome_credentials_email(user: dict, temp_password: str):
  from app.tasks.email_tasks import send_email

  send_email.delay(
    user["email"],
    "Your TaskFlow account",
    f"Hi {user.get('name', '')},\n\nEmail: {user['email']}\nTemporary password: {temp_password}\n\nPlease log in and change your password.",
  )


def send_task_assigned_email(assignee: dict, task: dict, app_base_url: str | None = None):
  from app.tasks.email_tasks import send_email

  base = app_base_url or Config.FRONTEND_URL
  link = f"{base}/tasks/{task['id'] if isinstance(task.get('id'), str) else task.get('_id')}"
  send_email.delay(
    assignee["email"],
    f"New task assigned: {task.get('title')}",
    f"Hi {assignee.get('name', '')},\n\nYou have been assigned: {task.get('title')}\n"
    f"Due: {task.get('due_date', 'N/A')}\n\nView: {link}",
  )
