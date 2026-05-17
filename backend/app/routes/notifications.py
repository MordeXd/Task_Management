from flask import Blueprint, jsonify, request

from app.decorators import jwt_required_active
from app.models.notification import notifications_repo

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.get("")
@jwt_required_active
def list_notifications(user):
  limit = request.args.get("limit", 50, type=int)
  skip = request.args.get("skip", 0, type=int)
  notifs = notifications_repo.find_by_user(user["_id"], limit=limit, skip=skip)
  return jsonify({"notifications": [notifications_repo.serialize(n) for n in notifs]})


@notifications_bp.get("/unread-count")
@jwt_required_active
def unread_count(user):
  count = notifications_repo.count_unread(user["_id"])
  return jsonify({"count": count})


@notifications_bp.patch("/<notification_id>/read")
@jwt_required_active
def mark_read(user, notification_id):
  notif = notifications_repo.find_by_id(notification_id)
  if not notif or str(notif.get("user_id")) != str(user["_id"]):
    return jsonify({"message": "Notification not found"}), 404
  notifications_repo.mark_as_read(notification_id)
  return jsonify({"message": "Marked as read"})


@notifications_bp.patch("/read-all")
@jwt_required_active
def mark_all_read(user):
  notifications_repo.mark_all_as_read(user["_id"])
  return jsonify({"message": "All marked as read"})
