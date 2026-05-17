from flask import Blueprint, jsonify, request

from app.decorators import require_roles
from app.models.company import companies_repo
from app.models.user import UserRepository, users_repo
from app.permissions import user_belongs_to_company
from app.services.email_service import send_welcome_credentials_email
from app.utils import generate_temp_password, oid

company_bp = Blueprint("company", __name__, url_prefix="/api/company")


def _resolve_company_id(user):
  if user["role"] == "super_admin":
    company_id = request.args.get("company_id") or (request.get_json(silent=True) or {}).get("company_id")
    if company_id:
      return oid(company_id)
    company = companies_repo.find_first()
    return company["_id"] if company else None
  return user.get("company_id")


@company_bp.get("/admins")
@require_roles("super_admin")
def list_admins(user):
  company_id = _resolve_company_id(user)
  if not company_id:
    return jsonify({"message": "No company found"}), 400
  admins = users_repo.list_by_role_and_company("admin", company_id)
  return jsonify({"admins": [users_repo.to_public(a) for a in admins]})


@company_bp.post("/admins")
@require_roles("super_admin")
def create_admin(user):
  data = request.get_json(silent=True) or {}
  name = (data.get("name") or "").strip()
  email = (data.get("email") or "").lower().strip()
  if not name or not email:
    return jsonify({"message": "Name and email are required"}), 400
  if users_repo.find_by_email(email):
    return jsonify({"message": "Email already in use"}), 409
  company_id = _resolve_company_id(user)
  if not company_id:
    return jsonify({"message": "No company found"}), 400
  password = (data.get("password") or "").strip()
  use_temp = not password or len(password) < 6
  final_password = password if not use_temp else generate_temp_password()
  new_user = users_repo.create({
    "name": name,
    "email": email,
    "password_hash": UserRepository.hash_password(final_password),
    "role": "admin",
    "company_id": company_id,
    "is_active": True,
    "reset_token_hash": None,
    "reset_token_expiry": None,
    "department": (data.get("department") or "").strip(),
  })
  public = users_repo.to_public(new_user)
  send_welcome_credentials_email(new_user, final_password, creator=user)
  return jsonify({"user": public, "temporary_password": final_password}), 201


@company_bp.get("/employees")
@require_roles("admin", "super_admin")
def list_employees(user):
  company_id = _resolve_company_id(user)
  if not company_id:
    return jsonify({"message": "No company found"}), 400
  employees = users_repo.list_by_role_and_company("employee", company_id)
  return jsonify({"employees": [users_repo.to_public(e) for e in employees]})


@company_bp.post("/employees")
@require_roles("admin")
def create_employee(user):
  data = request.get_json(silent=True) or {}
  name = (data.get("name") or "").strip()
  email = (data.get("email") or "").lower().strip()
  if not name or not email:
    return jsonify({"message": "Name and email are required"}), 400
  if users_repo.find_by_email(email):
    return jsonify({"message": "Email already in use"}), 409
  company_id = user.get("company_id")
  if not company_id:
    return jsonify({"message": "Admin has no company"}), 400
  password = (data.get("password") or "").strip()
  use_temp = not password or len(password) < 6
  final_password = password if not use_temp else generate_temp_password()
  new_user = users_repo.create({
    "name": name,
    "email": email,
    "password_hash": UserRepository.hash_password(final_password),
    "role": "employee",
    "company_id": company_id,
    "created_by": user["_id"],
    "is_active": True,
    "reset_token_hash": None,
    "reset_token_expiry": None,
    "department": (data.get("department") or "").strip(),
  })
  public = users_repo.to_public(new_user)
  send_welcome_credentials_email(new_user, final_password, creator=user)
  return jsonify({"user": public, "temporary_password": final_password}), 201


@company_bp.put("/users/<user_id>")
@require_roles("admin", "super_admin")
def update_user(user, user_id):
  target = users_repo.find_by_id(user_id)
  if not target or not user_belongs_to_company(user, target):
    return jsonify({"message": "User not found"}), 404
  data = request.get_json(silent=True) or {}
  updates = {}
  if data.get("name"):
    updates["name"] = data["name"].strip()
  if data.get("email"):
    email = data["email"].lower().strip()
    existing = users_repo.find_by_email(email)
    if existing and str(existing["_id"]) != str(target["_id"]):
      return jsonify({"message": "Email already in use"}), 409
    updates["email"] = email
  if "department" in data:
    updates["department"] = (data.get("department") or "").strip()
  if "profile_picture" in data:
    updates["profile_picture"] = data["profile_picture"]
  if not updates:
    return jsonify({"message": "No updates provided"}), 400
  updated = users_repo.update(target["_id"], updates)
  return jsonify({"user": users_repo.to_public(updated)})


@company_bp.patch("/users/<user_id>/deactivate")
@require_roles("admin", "super_admin")
def deactivate_user(user, user_id):
  if str(user["_id"]) == str(user_id):
    return jsonify({"message": "Cannot deactivate your own account"}), 400
  target = users_repo.find_by_id(user_id)
  if not target or not user_belongs_to_company(user, target):
    return jsonify({"message": "User not found"}), 404
  if target["role"] == "super_admin":
    return jsonify({"message": "Cannot deactivate super admin"}), 400
  updated = users_repo.update(target["_id"], {"is_active": False})
  return jsonify({"user": users_repo.to_public(updated)})
