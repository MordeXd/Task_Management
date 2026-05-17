from flask import Blueprint, jsonify

from app.decorators import require_roles
from app.extensions import db
from app.models.user import users_repo
from app.permissions import ensure_company_access
from app.utils import oid, serialize_doc

super_admin_bp = Blueprint("super_admin", __name__, url_prefix="/api/super-admin")


@super_admin_bp.get("/admins")
@require_roles("super_admin")
def list_admins(user):
  admins = users_repo.list_by_role_and_company("admin", user.get("company_id"))
  tasks_col = db["tasks"]
  result = []
  for admin in admins:
    admin_id = admin["_id"]
    employee_count = users_repo.collection.count_documents({"created_by": admin_id, "is_active": True, "role": "employee"})
    pending = tasks_col.count_documents({"assigned_by": admin_id, "status": "pending"})
    data = serialize_doc(admin)
    data["employee_count"] = employee_count
    data["pending_tasks"] = pending
    result.append(data)
  return jsonify({"admins": result})


@super_admin_bp.get("/admins/<admin_id>/employees")
@require_roles("super_admin")
def list_admin_employees(user, admin_id):
  admin = users_repo.find_by_id(admin_id)
  if not admin or admin["role"] != "admin":
    return jsonify({"message": "Admin not found"}), 404
  err = ensure_company_access(user, admin.get("company_id"))
  if err:
    return err
  employees = list(users_repo.collection.find({"created_by": oid(admin_id), "is_active": True, "role": "employee"}).sort("name", 1))
  tasks_col = db["tasks"]
  result = []
  for emp in employees:
    emp_id = emp["_id"]
    pending = tasks_col.count_documents({"assigned_to": emp_id, "status": "pending"})
    completed = tasks_col.count_documents({"assigned_to": emp_id, "status": "completed"})
    data = serialize_doc(emp)
    data["pending_tasks"] = pending
    data["completed_tasks"] = completed
    result.append(data)
  return jsonify({"employees": result})


@super_admin_bp.get("/employees/<employee_id>")
@require_roles("super_admin")
def get_employee_detail(user, employee_id):
  emp = users_repo.find_by_id(employee_id)
  if not emp or emp["role"] != "employee":
    return jsonify({"message": "Employee not found"}), 404
  err = ensure_company_access(user, emp.get("company_id"))
  if err:
    return err
  tasks_col = db["tasks"]
  from app.models.task import tasks_repo
  pending_tasks = [tasks_repo.populate_users(t) for t in tasks_col.find({"assigned_to": emp["_id"], "status": "pending"}).sort("created_at", -1)]
  completed_tasks = [tasks_repo.populate_users(t) for t in tasks_col.find({"assigned_to": emp["_id"], "status": "completed"}).sort("created_at", -1)]
  return jsonify({
    "employee": serialize_doc(emp),
    "pending_tasks": pending_tasks,
    "completed_tasks": completed_tasks,
  })
