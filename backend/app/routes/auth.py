import hashlib
from datetime import timedelta

import bcrypt
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
  create_access_token,
  create_refresh_token,
  decode_token,
  get_jwt,
  get_jwt_identity,
)
from flask_jwt_extended import jwt_required as jwt_required_decorator

from app.decorators import get_current_user, jwt_required_active
from app.extensions import limiter, token_blacklist
from app.models.user import UserRepository, users_repo
from app.permissions import ensure_company_access
from app.services.email_service import send_password_reset_email
from app.utils import utcnow
from app.validators import validate_email, validate_password, validate_string_length

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _tokens_for_user(user):
  identity = str(user["_id"])
  additional = {
    "role": user["role"],
    "company_id": str(user["company_id"]) if user.get("company_id") else None,
  }
  access = create_access_token(identity=identity, additional_claims=additional)
  refresh = create_refresh_token(identity=identity, additional_claims=additional)
  return access, refresh


@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login():
  data = request.get_json(silent=True) or {}
  email = (data.get("email") or "").lower().strip()
  password = data.get("password") or ""
  if not email or not validate_email(email):
    return jsonify({"message": "Invalid email format"}), 400
  if not password:
    return jsonify({"message": "Password is required"}), 400
  user = users_repo.find_by_email(email)
  if not user or not user.get("is_active"):
    return jsonify({"message": "Invalid email or password"}), 401
  if not UserRepository.check_password(password, user["password_hash"]):
    return jsonify({"message": "Invalid email or password"}), 401
  access, refresh = _tokens_for_user(user)
  return jsonify({
    "access_token": access,
    "refresh_token": refresh,
    "user": users_repo.to_public(user),
  })


@auth_bp.post("/refresh")
@jwt_required_decorator(refresh=True)
def refresh():
  user_id = get_jwt_identity()
  jti = get_jwt().get("jti")
  if jti in token_blacklist:
    return jsonify({"message": "Token revoked"}), 401
  user = users_repo.find_by_id(user_id)
  if not user or not user.get("is_active"):
    return jsonify({"message": "Unauthorized"}), 401
  token_blacklist.add(jti)
  access, refresh = _tokens_for_user(user)
  return jsonify({"access_token": access, "refresh_token": refresh})


@auth_bp.get("/me")
@jwt_required_active
def me(user):
  return jsonify({"user": users_repo.to_public(user)})


@auth_bp.get("/users/<user_id>")
@jwt_required_active
def get_user(user, user_id):
  target = users_repo.find_by_id(user_id)
  if not target:
    return jsonify({"message": "User not found"}), 404
  err = ensure_company_access(user, target.get("company_id"))
  if err:
    return err
  return jsonify({"user": users_repo.to_public(target)})


@auth_bp.post("/logout")
@jwt_required_decorator(refresh=True)
def logout():
  jti = get_jwt().get("jti")
  if jti:
    token_blacklist.add(jti)
  return jsonify({"message": "Logged out"})


@auth_bp.post("/forgot-password")
@limiter.limit("3 per hour", key_func=lambda: (request.get_json(silent=True) or {}).get("email", "unknown"))
def forgot_password():
  data = request.get_json(silent=True) or {}
  email = (data.get("email") or "").lower().strip()
  if email and not validate_email(email):
    return jsonify({"message": "Invalid email format"}), 400
  user = users_repo.find_by_email(email)
  if user and user.get("is_active"):
    reset_token = create_access_token(
      identity=str(user["_id"]),
      expires_delta=timedelta(minutes=30),
      additional_claims={"purpose": "reset"},
    )
    token_hash = bcrypt.hashpw(reset_token.encode(), bcrypt.gensalt()).decode()
    users_repo.update(
      user["_id"],
      {
        "reset_token_hash": token_hash,
        "reset_token_expiry": utcnow() + timedelta(minutes=30),
      },
    )
    link = f"{current_app.config['FRONTEND_URL']}/reset-password/{reset_token}"
    send_password_reset_email(user, link)
    current_app.logger.info("Password reset link for %s: %s", email, link)
  return jsonify({"message": "If an account exists, a reset link has been sent."})


@auth_bp.post("/reset-password")
@limiter.limit("5 per minute")
def reset_password():
  data = request.get_json(silent=True) or {}
  token = data.get("token") or ""
  password = data.get("password") or ""
  pw_error = validate_password(password)
  if pw_error:
    return jsonify({"message": pw_error}), 400
  try:
    decoded = decode_token(token)
  except Exception:
    return jsonify({"message": "Invalid or expired token"}), 400
  if decoded.get("purpose") != "reset":
    return jsonify({"message": "Invalid token"}), 400
  user = users_repo.find_by_id(decoded["sub"])
  if not user or not user.get("reset_token_hash"):
    return jsonify({"message": "Invalid or expired token"}), 400
  if user.get("reset_token_expiry") and user["reset_token_expiry"] < utcnow():
    return jsonify({"message": "Token expired"}), 400
  if not bcrypt.checkpw(token.encode(), user["reset_token_hash"].encode()):
    return jsonify({"message": "Invalid or expired token"}), 400
  users_repo.update(
    user["_id"],
    {
      "password_hash": UserRepository.hash_password(password),
      "reset_token_hash": None,
      "reset_token_expiry": None,
    },
  )
  return jsonify({"message": "Password updated successfully"})


@auth_bp.put("/profile")
@jwt_required_active
def update_profile(user):
  data = request.get_json(silent=True) or {}
  updates = {}
  if "name" in data:
    name = (data.get("name") or "").strip()
    if name:
      updates["name"] = name
  if "phone" in data:
    updates["phone"] = (data.get("phone") or "").strip()
  if not updates:
    return jsonify({"message": "No updates provided"}), 400
  updated = users_repo.update(user["_id"], updates)
  return jsonify({"user": users_repo.to_public(updated)})


@auth_bp.post("/change-password")
@jwt_required_active
def change_password(user):
  data = request.get_json(silent=True) or {}
  old_password = data.get("old_password") or ""
  new_password = data.get("new_password") or ""
  pw_error = validate_password(new_password)
  if pw_error:
    return jsonify({"message": pw_error}), 400
  if not UserRepository.check_password(old_password, user["password_hash"]):
    return jsonify({"message": "Current password is incorrect"}), 400
  users_repo.update(user["_id"], {"password_hash": UserRepository.hash_password(new_password)})
  return jsonify({"message": "Password changed successfully"})
