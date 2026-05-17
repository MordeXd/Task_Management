from app import extensions
from app.utils import oid, serialize_doc, utcnow


NOTIFICATION_TYPES = ("task_assigned", "task_completed", "task_updated", "task_deleted", "info")


class NotificationRepository:
  collection_name = "notifications"

  @property
  def collection(self):
    return extensions.db[self.collection_name]

  def create(self, data: dict):
    now = utcnow()
    doc = {**data, "read": False, "created_at": now}
    result = self.collection.insert_one(doc)
    return self.find_by_id(result.inserted_id)

  def find_by_id(self, notification_id):
    return self.collection.find_one({"_id": oid(notification_id)})

  def find_by_user(self, user_id, limit=50, skip=0):
    return list(
      self.collection.find({"user_id": oid(user_id)})
      .sort("created_at", -1)
      .skip(skip)
      .limit(limit)
    )

  def count_unread(self, user_id):
    return self.collection.count_documents({"user_id": oid(user_id), "read": False})

  def mark_as_read(self, notification_id):
    self.collection.update_one({"_id": oid(notification_id)}, {"$set": {"read": True}})

  def mark_all_as_read(self, user_id):
    self.collection.update_many(
      {"user_id": oid(user_id), "read": False}, {"$set": {"read": True}}
    )

  def serialize(self, notification: dict) -> dict:
    data = serialize_doc(notification)
    if not data:
      return data
    if data.get("task_id"):
      data["task_id"] = str(data["task_id"])
    return data


notifications_repo = NotificationRepository()
