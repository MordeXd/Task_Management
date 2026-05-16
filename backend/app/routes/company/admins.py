from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from app.models import User
import secrets
import string
import logging
import os

logger = logging.getLogger(__name__)

company_bp = Blueprint('company', __name__, url_prefix='/api/company')


def get_db():
    return current_app.db


def role_required(*roles):
    """Decorator to check if user has required role"""
    def decorator(f):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role')
            if user_role not in roles:
                return jsonify({'message': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator


def generate_temp_password(length=12):
    """Generate a random temporary password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def send_credential_email(to_email: str, temp_password: str, role: str):
    """Send credential email via Celery (simulated for now)"""
    logger.info(f"Sending {role} credentials to {to_email}")
    print(f"=== EMAIL SIMULATION ===")
    print(f"To: {to_email}")
    print(f"Subject: Your {role.title()} Account Credentials")
    print(f"Username: {to_email}")
    print(f"Temporary Password: {temp_password}")
    print(f"========================")


@company_bp.route('/admins', methods=['GET'])
@role_required('super_admin')
def get_admins():
    """Get all admins for the super admin's company"""
    claims = get_jwt()
    company_id = claims.get('company_id')

    db = get_db()

    # Find all admins with same company_id
    admins = list(db.users.find({
        'role': 'admin',
        'company_id': company_id
    }))

    # Convert to list of dicts
    admin_list = []
    for admin in admins:
        admin_list.append({
            '_id': str(admin['_id']),
            'email': admin['email'],
            'role': admin['role'],
            'company_id': admin.get('company_id'),
            'is_active': admin.get('is_active', True),
            'created_at': admin.get('created_at').isoformat() if admin.get('created_at') else None,
            'updated_at': admin.get('updated_at').isoformat() if admin.get('updated_at') else None
        })

    return jsonify({'admins': admin_list}), 200


@company_bp.route('/admins', methods=['POST'])
@role_required('super_admin')
def create_admin():
    """Create a new admin for the super admin's company"""
    claims = get_jwt()
    company_id = claims.get('company_id')

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')  # Optional, for future use

    if not email:
        return jsonify({'message': 'Email is required'}), 400
    if not password:
        return jsonify({'message': 'Password is required'}), 400
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    # Normalize email
    email = email.lower().strip()

    db = get_db()

    # Check if user already exists
    existing = User.find_by_email(db, email)
    if existing:
        return jsonify({'message': 'User with this email already exists'}), 400

    # Create new admin with provided password
    new_admin = User(
        email=email,
        role='admin',
        company_id=company_id,
        is_active=True
    )
    new_admin.set_password(password)
    new_admin.save(db)

    logger.info(f"Created new admin: {email} by super_admin")

    return jsonify({
        'message': 'Admin created successfully',
        'admin': {
            'id': str(new_admin._id),
            'email': new_admin.email,
            'role': new_admin.role,
            'company_id': new_admin.company_id,
            'is_active': new_admin.is_active,
        }
    }), 201


# Employee endpoints - accessible by both admin and super_admin
@company_bp.route('/employees', methods=['GET'])
@role_required('admin', 'super_admin')
def get_employees():
    """Get all employees for the user's company"""
    claims = get_jwt()
    company_id = claims.get('company_id')
    user_role = claims.get('role')

    db = get_db()

    # For admin: get employees they created (tracked via created_by field)
    # For super_admin: get all employees in the company
    query = {
        'role': 'employee',
        'company_id': company_id
    }

    # If admin, only show employees they created
    if user_role == 'admin':
        claims_user_id = claims.get('user_id')
        query['created_by'] = claims_user_id

    employees = list(db.users.find(query))

    employee_list = []
    for emp in employees:
        employee_list.append({
            '_id': str(emp['_id']),
            'email': emp['email'],
            'name': emp.get('name'),
            'role': emp['role'],
            'company_id': emp.get('company_id'),
            'is_active': emp.get('is_active', True),
            'created_at': emp.get('created_at').isoformat() if emp.get('created_at') else None,
            'updated_at': emp.get('updated_at').isoformat() if emp.get('updated_at') else None
        })

    return jsonify({'employees': employee_list}), 200


@company_bp.route('/employees', methods=['POST'])
@role_required('admin')
def create_employee():
    """Create a new employee for the admin's company"""
    claims = get_jwt()
    company_id = claims.get('company_id')
    user_id = claims.get('user_id')

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')  # Optional

    if not email:
        return jsonify({'message': 'Email is required'}), 400
    if not password:
        return jsonify({'message': 'Password is required'}), 400
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    # Normalize email
    email = email.lower().strip()

    db = get_db()

    # Check if user already exists
    existing = User.find_by_email(db, email)
    if existing:
        return jsonify({'message': 'User with this email already exists'}), 400

    # Create new employee with provided password
    new_employee = User(
        email=email,
        name=name,
        role='employee',
        company_id=company_id,
        is_active=True,
        created_by=user_id  # Track who created this employee
    )
    new_employee.set_password(password)
    new_employee.save(db)

    logger.info(f"Created new employee: {email} by admin {user_id}")

    return jsonify({
        'message': 'Employee created successfully',
        'employee': {
            'id': str(new_employee._id),
            'email': new_employee.email,
            'name': new_employee.name,
            'role': new_employee.role,
            'company_id': new_employee.company_id,
            'is_active': new_employee.is_active,
        }
    }), 201


# User management endpoints - update and deactivate
@company_bp.route('/users/<user_id>', methods=['PUT'])
@role_required('admin', 'super_admin')
def update_user(user_id):
    """Update user details (name, email, password)"""
    claims = get_jwt()
    company_id = claims.get('company_id')
    current_user_id = claims.get('user_id')

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    db = get_db()

    # Find the user to update
    user = User.find_by_id(db, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Verify user is in same company
    if user.company_id != company_id:
        return jsonify({'message': 'User not found in your company'}), 404

    # Update fields
    if 'email' in data and data['email']:
        new_email = data['email'].lower().strip()
        # Check if email is already taken by another user
        existing = User.find_by_email(db, new_email)
        if existing and str(existing._id) != user_id:
            return jsonify({'message': 'Email already in use'}), 400
        user.email = new_email

    if 'name' in data:
        user.name = data['name']

    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        user.set_password(data['password'])

    user.save(db)

    logger.info(f"Updated user: {user.email} by user {current_user_id}")

    return jsonify({
        'message': 'User updated successfully',
        'user': {
            '_id': str(user._id),
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'company_id': user.company_id,
            'is_active': user.is_active,
        }
    }), 200


@company_bp.route('/users/<user_id>/deactivate', methods=['PATCH'])
@role_required('admin', 'super_admin')
def deactivate_user(user_id):
    """Deactivate a user (soft delete)"""
    claims = get_jwt()
    company_id = claims.get('company_id')
    current_user_id = claims.get('user_id')

    db = get_db()

    # Find the user to deactivate
    user = User.find_by_id(db, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Verify user is in same company
    if user.company_id != company_id:
        return jsonify({'message': 'User not found in your company'}), 404

    # Cannot deactivate own account
    if str(user._id) == current_user_id:
        return jsonify({'message': 'Cannot deactivate your own account'}), 400

    # Deactivate the user
    user.is_active = False
    user.save(db)

    logger.info(f"Deactivated user: {user.email} by user {current_user_id}")

    return jsonify({
        'message': 'User deactivated successfully',
        'user': {
            '_id': str(user._id),
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'company_id': user.company_id,
            'is_active': user.is_active,
        }
    }), 200