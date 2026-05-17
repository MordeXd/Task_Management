import logging
import os
import time
import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, g, request
from flask_cors import CORS

from app.config import Config
from app.extensions import init_mongo, jwt, limiter

logger = logging.getLogger("taskflow")


def create_app(config_class=Config):
  load_dotenv()
  app = Flask(__name__)
  app.config.from_object(config_class)

  logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
  )

  @app.before_request
  def start_timer():
    g.start_time = time.time()
    g.request_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex[:12]

  @app.after_request
  def log_request(resp):
    duration = time.time() - g.get("start_time", time.time())
    user_id = ""
    try:
      from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
      verify_jwt_in_request(optional=True)
      uid = get_jwt_identity()
      if uid:
        user_id = f" user={uid}"
    except Exception:
      pass
    logger.info(
      "%s %s %s %s%.0fms%s",
      request.method,
      request.path,
      resp.status_code,
      user_id,
      duration * 1000,
      "" if resp.status_code < 400 else f" {resp.get_data(as_text=True)[:200]}",
    )
    return resp

  CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

  init_mongo(app)
  jwt.init_app(app)

  try:
    from flask_talisman import Talisman

    Talisman(
      app,
      force_https=False,
      strict_transport_security=False,
      x_xss_protection=True,
      x_content_type_options=True,
      referrer_policy="strict-origin-when-cross-origin",
      content_security_policy={
        "default-src": "'self'",
        "font-src": "'self' data:",
        "img-src": "'self' data: blob:",
        "style-src": "'self' 'unsafe-inline'",
        "script-src": "'self' 'unsafe-inline'",
      },
    )
  except ImportError:
    app.logger.warning("Flask-Talisman not installed — skipping security headers")

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



  @app.post("/api/errors/client")
  def client_error():
    data = request.get_json(silent=True) or {}
    logger.warning("Client error: %s | URL: %s | UA: %s", data.get("message"), data.get("url"), data.get("userAgent"))
    return "", 204

  import os
  upload_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
  os.makedirs(upload_path, exist_ok=True)
  from flask import send_from_directory
  @app.route("/uploads/<path:filename>")
  def serve_upload(filename):
    return send_from_directory(upload_path, filename)

  @app.errorhandler(429)
  def ratelimit_handler(e):
    resp = jsonify({"message": "Too many requests. Please try again later."})
    resp.status_code = 429
    retry_after = 60
    if hasattr(e, "reset_at") and e.reset_at:
      retry_after = max(1, int(e.reset_at - time.time()))
    elif hasattr(e, "retry_after") and e.retry_after:
      retry_after = int(e.retry_after)
    resp.headers["Retry-After"] = str(retry_after)
    return resp

  if app.config.get("SENTRY_DSN"):
    try:
      import sentry_sdk
      from sentry_sdk.integrations.flask import FlaskIntegration

      sentry_sdk.init(dsn=app.config["SENTRY_DSN"], integrations=[FlaskIntegration()])
    except ImportError:
      pass

  return app
