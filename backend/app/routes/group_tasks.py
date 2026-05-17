from flask import Blueprint, jsonify, request

from app.decorators import jwt_required_active, require_roles
from app.models.group_task import PRIORITIES, group_tasks_repo
from app.models.notification import notifications_repo
from app.models.user import users_repo
from app.permissions import user_belongs_to_company
from app.utils import oid, utcnow

group_tasks_bp = Blueprint("group_tasks", __name__, url_prefix="/api/group-tasks")


def _get_company(user):
  return user.get("company_id") if user.get("company_id") else None


@group_tasks_bp.get("")
@jwt_required_active
def list_group_tasks(user):
  tasks = group_tasks_repo.list_for_user(user)
  return jsonify({"tasks": [group_tasks_repo.populate_users(t) for t in tasks]})


@group_tasks_bp.post("")
@require_roles("admin", "super_admin")
def create_group_task(user):
  data = request.get_json(silent=True) or {}
  title = (data.get("title") or "").strip()
  if not title:
    return jsonify({"message": "Title is required"}), 400
  assigned_to = data.get("assigned_to", [])
  if not isinstance(assigned_to, list) or len(assigned_to) < 2:
    return jsonify({"message": "At least 2 assignees required"}), 400
  company_id = _get_company(user)
  valid_ids = []
  for uid in assigned_to:
    u = users_repo.find_by_id(uid)
    if not u or not u.get("is_active"):
      continue
    if str(u["_id"]) == str(user["_id"]):
      continue
    if u["role"] == "admin" and user["role"] != "super_admin":
      continue
    if not user_belongs_to_company(user, u):
      continue
    valid_ids.append(u["_id"])
  if len(valid_ids) < 2:
    return jsonify({"message": "At least 2 valid assignees required"}), 400
  priority = data.get("priority")
  if priority and priority not in PRIORITIES:
    return jsonify({"message": "Invalid priority"}), 400
  links = data.get("links", [])
  if not isinstance(links, list):
    links = []
  links = [l for l in links if isinstance(l, dict) and l.get("url")]
  task_data = {
    "title": title,
    "description": (data.get("description") or "").strip(),
    "priority": priority,
    "due_date": data.get("due_date"),
    "assigned_to": valid_ids,
    "assigned_by": user["_id"],
    "company_id": company_id,
    "status": "pending",
    "completed_at": None,
    "completed_by": None,
    "links": links,
  }
  task = group_tasks_repo.create(task_data)
  populated = group_tasks_repo.populate_users(task)
  for uid in valid_ids:
    notifications_repo.create({
      "user_id": uid,
      "type": "task_assigned",
      "title": "New Group Task",
      "message": f"You have been added to group task: {title}",
      "task_id": task["_id"],
    })
  return jsonify({"task": populated}), 201


@group_tasks_bp.get("/<task_id>")
@jwt_required_active
def get_group_task(user, task_id):
  task = group_tasks_repo.find_by_id(task_id)
  if not task:
    return jsonify({"message": "Task not found"}), 404
  if task.get("company_id") and str(task["company_id"]) != str(_get_company(user)):
    return jsonify({"message": "Forbidden"}), 403
  return jsonify({"task": group_tasks_repo.populate_users(task)})


@group_tasks_bp.put("/<task_id>")
@require_roles("admin", "super_admin")
def update_group_task(user, task_id):
  task = group_tasks_repo.find_by_id(task_id)
  if not task:
    return jsonify({"message": "Task not found"}), 404
  data = request.get_json(silent=True) or {}
  updates = {}
  if data.get("title"):
    updates["title"] = data["title"].strip()
  if "description" in data:
    updates["description"] = (data.get("description") or "").strip()
  if data.get("priority"):
    if data["priority"] not in PRIORITIES:
      return jsonify({"message": "Invalid priority"}), 400
    updates["priority"] = data["priority"]
  if "due_date" in data:
    updates["due_date"] = data.get("due_date")
  if "links" in data:
    links = data["links"]
    if isinstance(links, list):
      updates["links"] = [l for l in links if isinstance(l, dict) and l.get("url")]
  if "assigned_to" in data:
    new_ids = data["assigned_to"]
    if isinstance(new_ids, list) and len(new_ids) >= 2:
      company_id = _get_company(user)
      valid_ids = []
      for uid in new_ids:
        u = users_repo.find_by_id(uid)
        if not u or not u.get("is_active"):
          continue
        if str(u["_id"]) == str(user["_id"]):
          continue
        if not user_belongs_to_company(user, u):
          continue
        valid_ids.append(u["_id"])
      if len(valid_ids) >= 2:
        updates["assigned_to"] = valid_ids
  if not updates:
    return jsonify({"message": "No updates provided"}), 400
  updated = group_tasks_repo.update(task_id, updates)
  return jsonify({"task": group_tasks_repo.populate_users(updated)})


@group_tasks_bp.delete("/<task_id>")
@require_roles("admin", "super_admin")
def delete_group_task(user, task_id):
  task = group_tasks_repo.find_by_id(task_id)
  if not task:
    return jsonify({"message": "Task not found"}), 404
  group_tasks_repo.delete(task_id)
  return jsonify({"message": "Task deleted"}), 200


@group_tasks_bp.patch("/<task_id>/complete")
@jwt_required_active
def complete_group_task(user, task_id):
  task = group_tasks_repo.find_by_id(task_id)
  if not task:
    return jsonify({"message": "Task not found"}), 404
  if task.get("status") == "completed":
    return jsonify({"task": group_tasks_repo.populate_users(task)})
  updated = group_tasks_repo.update(
    task_id,
    {"status": "completed", "completed_at": utcnow(), "completed_by": user["_id"]},
  )
  for uid in task.get("assigned_to", []):
    notifications_repo.create({
      "user_id": uid,
      "type": "task_completed",
      "title": "Group Task Completed",
      "message": f"Group task '{task.get('title')}' has been completed",
      "task_id": task["_id"],
    })
  return jsonify({"task": group_tasks_repo.populate_users(updated)})
