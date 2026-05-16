"""
Seed script to create super_admin user if none exists.
Run: python seed_superadmin.py
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import User


def seed_superadmin():
    """Create super_admin user if not exists"""
    app = create_app()

    with app.app_context():
        from flask import current_app
        db = current_app.db

        # Check if super_admin already exists
        existing = User.find_by_email(db, 'super@taskflow.com')

        if existing:
            print(f"Super admin user already exists: {existing.email}")
            return

        # Create super_admin user
        super_admin = User(
            email='super@taskflow.com',
            role=User.ROLE_SUPER_ADMIN,
            company_id=None,  # super_admin has no company
            is_active=True
        )
        super_admin.set_password('SuperAdmin123')
        super_admin.save(db)

        print(f"Created super_admin user: super@taskflow.com")
        print(f"Password: SuperAdmin123")


if __name__ == '__main__':
    seed_superadmin()