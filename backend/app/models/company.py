from app import extensions
from app.utils import oid, serialize_doc, utcnow


class CompanyRepository:
  collection_name = "companies"

  @property
  def collection(self):
    return extensions.db[self.collection_name]

  def find_by_id(self, company_id):
    return self.collection.find_one({"_id": oid(company_id)})

  def find_first(self):
    return self.collection.find_one({"is_active": True})

  def create(self, name: str):
    now = utcnow()
    doc = {"name": name, "is_active": True, "created_at": now, "updated_at": now}
    result = self.collection.insert_one(doc)
    return self.find_by_id(result.inserted_id)

  @staticmethod
  def to_public(company):
    return serialize_doc(company)


companies_repo = CompanyRepository()
