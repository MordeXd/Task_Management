from flask import request
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient


def _api_key_func():
    """Rate limit key: user ID for authenticated requests, IP for anonymous."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            from flask_jwt_extended import decode_token

            decoded = decode_token(auth.split(" ", 1)[1], allow_expired=True)
            return f"user:{decoded['sub']}"
        except Exception:
            pass
    return get_remote_address()


jwt = JWTManager()
limiter = Limiter(key_func=_api_key_func, default_limits=["100 per minute"])
mongo_client: MongoClient | None = None
db = None
token_blacklist: set[str] = set()


def init_mongo(app):
    global mongo_client, db
    mongo_client = MongoClient(app.config["MONGO_URI"])
    db = mongo_client.get_default_database()
