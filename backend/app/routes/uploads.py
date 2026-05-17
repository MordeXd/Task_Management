import os
import uuid

from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from app.decorators import jwt_required_active, require_roles
from app.models.group_task import group_tasks_repo
from app.models.task import tasks_repo
from app.models.user import users_repo
from app.permissions import can_modify_task, user_belongs_to_company

UPLOAD_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
ALLOWED_EXTENSIONS = {
    "pdf": {"pdf"},
    "image": {"png", "jpg", "jpeg", "gif", "webp", "svg"},
}

uploads_bp = Blueprint("uploads", __name__, url_prefix="/api/upload")


def _ext(filename: str) -> str:
    return (filename.rsplit(".", 1)[-1] or "").lower()


def _allowed(filename: str, category: str) -> bool:
    return _ext(filename) in ALLOWED_EXTENSIONS.get(category, set())


@uploads_bp.post("/<task_id>/<category>")
@require_roles("admin", "super_admin")
def upload_file(user, task_id, category):
    if category not in ("pdf", "image"):
        return jsonify({"message": "Category must be 'pdf' or 'image'"}), 400

    task = tasks_repo.find_by_id(task_id)
    if not task or not can_modify_task(user, task):
        return jsonify({"message": "Task not found"}), 404

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"message": "No file selected"}), 400

    if not _allowed(file.filename, category):
        return jsonify({"message": f"Invalid file type for {category}"}), 400

    filename = secure_filename(file.filename)
    name = f"{uuid.uuid4().hex[:8]}_{filename}"
    rel_dir = os.path.join(task_id, category)
    abs_dir = os.path.join(UPLOAD_BASE, rel_dir)
    os.makedirs(abs_dir, exist_ok=True)
    filepath = os.path.join(abs_dir, name)
    file.save(filepath)

    rel_path = os.path.join(rel_dir, name).replace("\\", "/")

    entry = {"name": filename, "path": rel_path}
    field = f"{category}s"
    tasks_repo.push_attachment(task_id, field, entry)

    return jsonify({"attachment": entry}), 201


@uploads_bp.get("/files/<path:filepath>")
def serve_file(filepath):
    safe = os.path.normpath(filepath)
    if safe.startswith("..") or os.path.isabs(safe):
        return jsonify({"message": "Invalid path"}), 400
    full = os.path.join(UPLOAD_BASE, safe)
    if not os.path.exists(full):
        return jsonify({"message": "File not found"}), 404
    return send_from_directory(os.path.dirname(full), os.path.basename(full))


@uploads_bp.post("/group-task/<task_id>/<category>")
@require_roles("admin", "super_admin")
def upload_group_file(user, task_id, category):
    if category not in ("pdf", "image"):
        return jsonify({"message": "Category must be 'pdf' or 'image'"}), 400

    task = group_tasks_repo.find_by_id(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"message": "No file selected"}), 400

    if not _allowed(file.filename, category):
        return jsonify({"message": f"Invalid file type for {category}"}), 400

    filename = secure_filename(file.filename)
    name = f"{uuid.uuid4().hex[:8]}_{filename}"
    rel_dir = os.path.join(task_id, category)
    abs_dir = os.path.join(UPLOAD_BASE, rel_dir)
    os.makedirs(abs_dir, exist_ok=True)
    filepath = os.path.join(abs_dir, name)
    file.save(filepath)

    rel_path = os.path.join(rel_dir, name).replace("\\", "/")

    entry = {"name": filename, "path": rel_path}
    field = f"{category}s"
    group_tasks_repo.push_attachment(task_id, field, entry)

    return jsonify({"attachment": entry}), 201


@uploads_bp.post("/profile")
@jwt_required_active
def upload_profile(user):
    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400
    file = request.files["file"]
    if not file.filename or not _allowed(file.filename, "image"):
        return jsonify({"message": "Invalid image file"}), 400
    filename = secure_filename(file.filename)
    name = f"profile_{uuid.uuid4().hex[:8]}_{filename}"
    rel_dir = "profiles"
    abs_dir = os.path.join(UPLOAD_BASE, rel_dir)
    os.makedirs(abs_dir, exist_ok=True)
    filepath = os.path.join(abs_dir, name)
    file.save(filepath)
    rel_path = os.path.join(rel_dir, name).replace("\\", "/")
    users_repo.update(user["_id"], {"profile_picture": rel_path})
    return jsonify({"profile_picture": rel_path}), 200
