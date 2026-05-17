import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import init_mongo, jwt, limiter


def create_app(config_class=Config):
  load_dotenv()
  app = Flask(__name__)
  app.config.from_object(config_class)

  logging.basicConfig(level=logging.INFO)

  CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

  init_mongo(app)
  jwt.init_app(app)

  limiter.init_app(app)
  if app.config.get("TESTING"):
    app.config["RATELIMIT_ENABLED"] = False

  @jwt.token_in_blocklist_loader
  def check_if_token_revoked(jwt_header, jwt_payload):
    from app.extensions import token_blacklist

    return jwt_payload.get("jti") in token_blacklist

  from app.routes.auth import auth_bp
  from app.routes.company import company_bp
  from app.routes.health import health_bp
  from app.routes.notifications import notifications_bp
  from app.routes.tasks import tasks_bp
  from app.routes.group_tasks import group_tasks_bp
  from app.routes.super_admin import super_admin_bp
  from app.routes.uploads import uploads_bp

  app.register_blueprint(health_bp)
  app.register_blueprint(auth_bp)
  app.register_blueprint(company_bp)
  app.register_blueprint(notifications_bp)
  app.register_blueprint(tasks_bp)
  app.register_blueprint(group_tasks_bp)
  app.register_blueprint(super_admin_bp)
  app.register_blueprint(uploads_bp)

  import os
  upload_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
  os.makedirs(upload_path, exist_ok=True)
  from flask import send_from_directory
  @app.route("/uploads/<path:filename>")
  def serve_upload(filename):
    return send_from_directory(upload_path, filename)

  @app.errorhandler(429)
  def ratelimit_handler(e):
    return jsonify({"message": "Too many requests. Please try again later."}), 429

  if app.config.get("SENTRY_DSN"):
    try:
      import sentry_sdk
      from sentry_sdk.integrations.flask import FlaskIntegration

      sentry_sdk.init(dsn=app.config["SENTRY_DSN"], integrations=[FlaskIntegration()])
    except ImportError:
      pass

  return app
