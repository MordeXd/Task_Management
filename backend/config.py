import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/taskmanager')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)  # 1 hour


class DevConfig(Config):
    DEBUG = True
    TESTING = False


class ProdConfig(Config):
    DEBUG = False
    TESTING = False


class TestConfig(Config):
    DEBUG = True
    TESTING = True
    MONGO_URI = os.getenv('MONGO_TEST_URI', 'mongodb://localhost:27017/taskmanager_test')


config = {
    'development': DevConfig,
    'production': ProdConfig,
    'testing': TestConfig,
    'default': DevConfig
}