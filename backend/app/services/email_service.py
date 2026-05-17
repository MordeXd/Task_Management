from app.config import Config


def send_password_reset_email(user: dict, reset_link: str):
  from app.tasks.email_tasks import send_email

  send_email.delay(
    user["email"],
    "Reset your TaskFlow password",
    f"""Hi {user.get('name', '')},

We received a request to reset your TaskFlow password.

Click the link below to reset it (expires in 30 minutes):
{reset_link}

If you didn't request this, you can safely ignore this email.

— TaskFlow Team""",
  )


def send_welcome_credentials_email(new_user: dict, temp_password: str, creator: dict | None = None):
  from app.tasks.email_tasks import send_email

  created_by = f" by {creator.get('name', '')} ({creator.get('email', '')})" if creator else ""

  send_email.delay(
    new_user["email"],
    f"Welcome to TaskFlow, {new_user.get('name', '')}!",
    f"""Hi {new_user.get('name', '')},

Welcome to TaskFlow! Your account has been created{created_by}.

Here are your login details:
  Email:    {new_user['email']}
  Password: {temp_password}

Please log in at {Config.FRONTEND_URL} and change your password.

We're excited to have you on board!

— TaskFlow Team""",
  )


def send_task_assigned_email(assignee: dict, task: dict, app_base_url: str | None = None, assigned_by: dict | None = None):
  from app.tasks.email_tasks import send_email

  base = app_base_url or Config.FRONTEND_URL
  link = f"{base}/tasks/{task['id'] if isinstance(task.get('id'), str) else task.get('_id')}"
  assigned_by_name = assigned_by.get("name", "Someone") if assigned_by else "Someone"
  send_email.delay(
    assignee["email"],
    f"New task assigned: {task.get('title')}",
    f"""Hi {assignee.get('name', '')},

{assigned_by_name} has assigned you a new task:

  Title: {task.get('title')}
  Due:   {task.get('due_date', 'N/A')}

View task: {link}

— TaskFlow Team""",
  )
