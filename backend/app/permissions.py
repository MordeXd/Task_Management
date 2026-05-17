from bson import ObjectId

from app.utils import oid


def same_company(user: dict, company_id) -> bool:
  if user["role"] == "super_admin":
    if not user.get("company_id"):
      return True
    return str(user["company_id"]) == str(company_id) if company_id else True
  if not user.get("company_id") or not company_id:
    return False
  return str(user["company_id"]) == str(company_id)


def ensure_company_access(user: dict, company_id) -> tuple[dict, int] | None:
  from flask import jsonify
  if not same_company(user, company_id):
    return jsonify({"message": "Forbidden"}), 403
  return None


def can_view_task(user: dict, task: dict) -> bool:
  if not same_company(user, task.get("company_id")):
    return False
  if user["role"] in ("admin", "super_admin"):
    return True
  return task.get("assigned_to") == user["_id"]


def can_modify_task(user: dict, task: dict) -> bool:
  if not same_company(user, task.get("company_id")):
    return False
  return user["role"] in ("admin", "super_admin")


def can_complete_task(user: dict, task: dict) -> bool:
  if not same_company(user, task.get("company_id")):
    return False
  if user["role"] in ("admin", "super_admin"):
    return True
  return task.get("assigned_to") == user["_id"]


def user_belongs_to_company(user: dict, target_user: dict) -> bool:
  if user["role"] == "super_admin":
    return True
  return (
    user.get("company_id")
    and target_user.get("company_id")
    and str(user["company_id"]) == str(target_user["company_id"])
  )
