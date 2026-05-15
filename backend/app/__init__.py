import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo

mongo = PyMongo()
jwt = JWTManager()


def create_app(config_name=None):
    app = Flask(__name__)

    # Load config
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    from config import config
    app.config.from_object(config[config_name])

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)

    # Register blueprints (will add routes later)
    # from app.routes import api_bp
    # app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return {'message': 'Task Management API', 'status': 'running'}

    @app.route('/health')
    def health():
        return {'status': 'healthy'}

    @app.route('/api/ping')
    def ping():
        try:
            # Check MongoDB connection
            mongo.db.command('ping')
            return {
                'status': 'ok',
                'message': 'MongoDB connected',
                'database': mongo.db.name
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }, 500

    return app