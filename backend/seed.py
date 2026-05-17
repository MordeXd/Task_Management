"""Seed demo company and super admin user."""
import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app import extensions
from app.models.company import companies_repo
from app.models.user import UserRepository, users_repo


def seed():
  app = create_app()
  with app.app_context():
    company = companies_repo.find_first()
    if not company:
      company = companies_repo.create("TaskFlow Demo")
      print(f"Created company: {company['name']}")

    super_email = "super@taskflow.com"
    existing = users_repo.find_by_email(super_email)
    if not existing:
      users_repo.create({
        "name": "Super Admin",
        "email": super_email,
        "password_hash": UserRepository.hash_password("SuperAdmin123"),
        "role": "super_admin",
        "company_id": None,
        "is_active": True,
        "reset_token_hash": None,
        "reset_token_expiry": None,
      })
      print(f"Created super admin: {super_email} / SuperAdmin123")
    else:
      print("Super admin already exists")

    # Ensure indexes
    extensions.db.users.create_index("email", unique=True)
    print("Seed complete.")


if __name__ == "__main__":
  seed()
