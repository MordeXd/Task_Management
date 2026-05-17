from flask import Blueprint, jsonify, request

from app.decorators import jwt_required_active, require_roles
from app.models.notification import notifications_repo
from app.models.task import PRIORITIES, tasks_repo
from app.models.user import users_repo
from app.permissions import can_complete_task, can_modify_task, can_view_task, same_company
from app.services.email_service import send_task_assigned_email
from app.utils import oid, utcnow
from app.validators import validate_date, validate_priority, validate_string_length, validate_url

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


@tasks_bp.get("")
@jwt_required_active
def list_tasks(user):
  tasks = tasks_repo.list_for_user(user)
  return jsonify({"tasks": [tasks_repo.populate_users(t) for t in tasks]})


@tasks_bp.post("")
@require_roles("admin", "super_admin")
def create_task(user):
  data = request.get_json(silent=True) or {}
  title = (data.get("title") or "").strip()
  assigned_to = data.get("assigned_to")
  if not title or not validate_string_length(title, max_len=200):
    return jsonify({"message": "Title is required (max 200 chars)"}), 400
  if not assigned_to:
    return jsonify({"message": "Assignee is required"}), 400
  assignee = users_repo.find_by_id(assigned_to)
  if not assignee or assignee["role"] not in ("employee", "admin") or not assignee.get("is_active"):
    return jsonify({"message": "Invalid assignee"}), 400
  if str(assignee["_id"]) == str(user["_id"]):
    return jsonify({"message": "Cannot assign task to yourself"}), 400
  if assignee["role"] == "admin" and user["role"] != "super_admin":
    return jsonify({"message": "Invalid assignee"}), 400
  company_id = user.get("company_id") or assignee.get("company_id")
  if not same_company(user, company_id) or str(assignee.get("company_id")) != str(company_id):
    return jsonify({"message": "Assignee must be in your company"}), 400
  priority = data.get("priority")
  if priority and not validate_priority(priority):
    return jsonify({"message": "Invalid priority (low, medium, high)"}), 400
  due_date = data.get("due_date")
  if due_date and not validate_date(due_date):
    return jsonify({"message": "Invalid due_date format"}), 400
  links = data.get("links", [])
  if not isinstance(links, list):
    links = []
  links = [l for l in links if isinstance(l, dict) and l.get("url") and validate_url(l["url"])]
  task_data = {
    "title": title,
    "description": (data.get("description") or "").strip(),
    "priority": priority,
    "due_date": due_date,
    "assigned_to": assignee["_id"],
    "assigned_by": user["_id"],
    "company_id": company_id,
    "status": "pending",
    "completed_at": None,
    "completed_by": None,
    "links": links,
  }
  task = tasks_repo.create(task_data)
  populated = tasks_repo.populate_users(task)
  send_task_assigned_email(assignee, populated, assigned_by=user)
  notifications_repo.create({
    "user_id": assignee["_id"],
    "type": "task_assigned",
    "title": "New Task Assigned",
    "message": f"You have been assigned task: {title}",
    "task_id": task["_id"],
  })
  return jsonify({"task": populated}), 201


@tasks_bp.get("/<task_id>")
@jwt_required_active
def get_task(user, task_id):
  task = tasks_repo.find_by_id(task_id)
  if not task or not can_view_task(user, task):
    return jsonify({"message": "Task not found"}), 404
  return jsonify({"task": tasks_repo.populate_users(task)})


@tasks_bp.put("/<task_id>")
@require_roles("admin", "super_admin")
def update_task(user, task_id):
  task = tasks_repo.find_by_id(task_id)
  if not task or not can_modify_task(user, task):
    return jsonify({"message": "Task not found"}), 404
  data = request.get_json(silent=True) or {}
  updates = {}
  if data.get("title"):
    title = data["title"].strip()
    if not validate_string_length(title, max_len=200):
      return jsonify({"message": "Title too long (max 200 chars)"}), 400
    updates["title"] = title
  if "description" in data:
    desc = (data.get("description") or "").strip()
    if desc and not validate_string_length(desc, max_len=5000):
      return jsonify({"message": "Description too long (max 5000 chars)"}), 400
    updates["description"] = desc
  if data.get("priority"):
    if not validate_priority(data["priority"]):
      return jsonify({"message": "Invalid priority (low, medium, high)"}), 400
    updates["priority"] = data["priority"]
  if "due_date" in data:
    due = data.get("due_date")
    if due and not validate_date(due):
      return jsonify({"message": "Invalid due_date format"}), 400
    updates["due_date"] = due
  if "links" in data:
    links = data["links"]
    if isinstance(links, list):
      updates["links"] = [l for l in links if isinstance(l, dict) and l.get("url") and validate_url(l["url"])]
  if data.get("assigned_to"):
    assignee = users_repo.find_by_id(data["assigned_to"])
    if not assignee or assignee["role"] not in ("employee", "admin") or not assignee.get("is_active"):
      return jsonify({"message": "Invalid assignee"}), 400
    if str(assignee["_id"]) == str(user["_id"]):
      return jsonify({"message": "Cannot assign task to yourself"}), 400
    if assignee["role"] == "admin" and user["role"] != "super_admin":
      return jsonify({"message": "Invalid assignee"}), 400
    if not same_company(user, task.get("company_id")):
      return jsonify({"message": "Forbidden"}), 403
    updates["assigned_to"] = assignee["_id"]
    if str(assignee["_id"]) != str(task.get("assigned_to")):
      notifications_repo.create({
        "user_id": assignee["_id"],
        "type": "task_assigned",
        "title": "Task Reassigned",
        "message": f"A task has been reassigned to you: {task.get('title', 'Untitled')}",
        "task_id": task["_id"],
      })
  if not updates:
    return jsonify({"message": "No updates provided"}), 400
  updated = tasks_repo.update(task_id, updates)
  return jsonify({"task": tasks_repo.populate_users(updated)})


@tasks_bp.delete("/<task_id>")
@require_roles("admin", "super_admin")
def delete_task(user, task_id):
  task = tasks_repo.find_by_id(task_id)
  if not task or not can_modify_task(user, task):
    return jsonify({"message": "Task not found"}), 404
  tasks_repo.delete(task_id)
  return jsonify({"message": "Task deleted"}), 200


@tasks_bp.patch("/<task_id>/complete")
@jwt_required_active
def complete_task(user, task_id):
  task = tasks_repo.find_by_id(task_id)
  if not task or not can_complete_task(user, task):
    return jsonify({"message": "Task not found"}), 404
  if task.get("status") == "completed":
    return jsonify({"task": tasks_repo.populate_users(task)})
  updated = tasks_repo.update(
    task_id,
    {"status": "completed", "completed_at": utcnow(), "completed_by": user["_id"]},
  )
  return jsonify({"task": tasks_repo.populate_users(updated)})
