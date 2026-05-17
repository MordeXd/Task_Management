import bcrypt
from bson import ObjectId

from app import extensions
from app.utils import oid, serialize_doc, utcnow

ROLES = ("super_admin", "admin", "employee")


class UserRepository:
  collection_name = "users"

  @property
  def collection(self):
    return extensions.db[self.collection_name]

  def find_by_id(self, user_id: str | ObjectId):
    return self.collection.find_one({"_id": oid(user_id)})

  def find_by_email(self, email: str):
    return self.collection.find_one({"email": email.lower().strip()})

  def create(self, data: dict):
    now = utcnow()
    doc = {**data, "created_at": now, "updated_at": now}
    result = self.collection.insert_one(doc)
    return self.find_by_id(result.inserted_id)

  def update(self, user_id: str | ObjectId, data: dict):
    data["updated_at"] = utcnow()
    self.collection.update_one({"_id": oid(user_id)}, {"$set": data})
    return self.find_by_id(user_id)

  def list_by_role_and_company(self, role: str, company_id: ObjectId | None):
    query = {"role": role, "is_active": True}
    if company_id:
      query["company_id"] = company_id
    return list(self.collection.find(query).sort("name", 1))

  @staticmethod
  def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

  @staticmethod
  def check_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())

  @staticmethod
  def to_public(user: dict | None) -> dict | None:
    if not user:
      return None
    data = serialize_doc(user)
    for key in ("password_hash", "reset_token_hash", "reset_token_expiry"):
      data.pop(key, None)
    return data


users_repo = UserRepository()
