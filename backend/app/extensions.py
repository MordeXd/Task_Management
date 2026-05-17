from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient

jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
mongo_client: MongoClient | None = None
db = None
token_blacklist: set[str] = set()


def init_mongo(app):
    global mongo_client, db
    mongo_client = MongoClient(app.config["MONGO_URI"])
    db = mongo_client.get_default_database()
