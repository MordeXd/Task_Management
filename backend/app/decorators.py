from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.extensions import limiter
from app.models.user import users_repo


def get_current_user():
  verify_jwt_in_request()
  user_id = get_jwt_identity()
  user = users_repo.find_by_id(user_id)
  if not user or not user.get("is_active"):
    return None
  return user


def jwt_required_active(fn):
  @wraps(fn)
  @limiter.limit("100 per minute")
  def wrapper(*args, **kwargs):
    user = get_current_user()
    if not user:
      return jsonify({"message": "Unauthorized"}), 401
    return fn(user, *args, **kwargs)

  return wrapper


def require_roles(*roles):
  def decorator(fn):
    @wraps(fn)
    @jwt_required_active
    def wrapper(user, *args, **kwargs):
      if user["role"] not in roles:
        return jsonify({"message": "Forbidden"}), 403
      return fn(user, *args, **kwargs)

    return wrapper

  return decorator
