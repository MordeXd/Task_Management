from bson import ObjectId

from app import extensions
from app.utils import oid, serialize_doc, utcnow

STATUSES = ("pending", "completed")
PRIORITIES = ("low", "medium", "high")


class GroupTaskRepository:
  collection_name = "group_tasks"

  @property
  def collection(self):
    return extensions.db[self.collection_name]

  def find_by_id(self, task_id):
    return self.collection.find_one({"_id": oid(task_id)})

  def create(self, data: dict):
    now = utcnow()
    doc = {
      **data,
      "status": data.get("status", "pending"),
      "images": [],
      "pdfs": [],
      "links": [],
      "created_at": now,
      "updated_at": now,
    }
    result = self.collection.insert_one(doc)
    return self.find_by_id(result.inserted_id)

  def update(self, task_id, data: dict):
    data["updated_at"] = utcnow()
    self.collection.update_one({"_id": oid(task_id)}, {"$set": data})
    return self.find_by_id(task_id)

  def delete(self, task_id):
    self.collection.delete_one({"_id": oid(task_id)})

  def push_attachment(self, task_id, field: str, entry: dict):
    self.collection.update_one(
      {"_id": oid(task_id)},
      {"$push": {field: entry}, "$set": {"updated_at": utcnow()}},
    )
    return self.find_by_id(task_id)

  def list_for_user(self, user: dict):
    query: dict = {}
    if user["role"] == "super_admin":
      if user.get("company_id"):
        query["company_id"] = user["company_id"]
    else:
      query["company_id"] = user.get("company_id")
    if user["role"] == "employee":
      query["assigned_to"] = user["_id"]
    return list(self.collection.find(query).sort("created_at", -1))

  def populate_users(self, task: dict) -> dict:
    from app.models.user import users_repo

    data = serialize_doc(task)
    if not data:
      return data
    assigned_to = task.get("assigned_to", [])
    if assigned_to:
      users = []
      for uid in assigned_to:
        u = users_repo.find_by_id(uid)
        if u:
          users.append({"id": str(u["_id"]), "name": u.get("name"), "email": u.get("email")})
      data["assigned_to_users"] = users
    for field in ("assigned_by", "completed_by"):
      ref = task.get(field)
      if ref:
        u = users_repo.find_by_id(ref)
        if u:
          data[f"{field}_user"] = {
            "id": str(u["_id"]),
            "name": u.get("name"),
            "email": u.get("email"),
          }
    return data


group_tasks_repo = GroupTaskRepository()
