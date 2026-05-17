import pytest
import mongomock
from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models.user import UserRepository, users_repo


@pytest.fixture
def app():
  app = create_app()
  app.config["TESTING"] = True
  app.config["RATELIMIT_ENABLED"] = False
  client = mongomock.MongoClient()
  import app.extensions as ext

  ext.mongo_client = client
  ext.db = client.taskflow
  yield app


@pytest.fixture
def client(app):
  return app.test_client()


@pytest.fixture
def super_admin(app):
  from app.models.company import companies_repo

  company = companies_repo.create("Test Co")
  user = users_repo.create({
    "name": "Super",
    "email": "super@test.com",
    "password_hash": UserRepository.hash_password("Password123!"),
    "role": "super_admin",
    "company_id": None,
    "is_active": True,
    "reset_token_hash": None,
    "reset_token_expiry": None,
  })
  return user, company
