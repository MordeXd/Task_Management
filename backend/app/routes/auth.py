from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    decode_token
)
from app.models import User
from bson import ObjectId
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)


def get_db():
    return current_app.db


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # Find user by email
    user = User.find_by_email(get_db(), email)

    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is inactive'}), 401

    # Check password
    if not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Create JWT tokens
    additional_claims = {
        'role': user.role,
        'company_id': str(user.company_id) if user.company_id else None
    }

    access_token = create_access_token(
        identity=str(user._id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=1)
    )

    refresh_token = create_refresh_token(
        identity=str(user._id),
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': str(user._id),
            'email': user.email,
            'role': user.role,
            'company_id': str(user.company_id) if user.company_id else None
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()

    # Get user from database
    user = User.find_by_id(get_db(), current_user_id)

    if not user or not user.is_active:
        return jsonify({'message': 'User not found or inactive'}), 401

    # Create new access token
    additional_claims = {
        'role': user.role,
        'company_id': str(user.company_id) if user.company_id else None
    }

    access_token = create_access_token(
        identity=str(user._id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=1)
    )

    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.find_by_id(get_db(), current_user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'id': str(user._id),
        'email': user.email,
        'role': user.role,
        'company_id': str(user.company_id) if user.company_id else None,
        'is_active': user.is_active
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for authenticated user"""
    current_user_id = get_jwt_identity()
    user = User.find_by_id(get_db(), current_user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'message': 'Old and new password are required'}), 400

    # Verify old password
    if not user.check_password(old_password):
        return jsonify({'message': 'Current password is incorrect'}), 401

    # Set new password
    user.set_password(new_password)
    user.save(get_db())

    logger.info(f"Password changed for user: {user.email}")

    return jsonify({'message': 'Password changed successfully'}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Generate password reset token and send email (simulated)"""
    data = request.get_json()

    if not data or not data.get('email'):
        return jsonify({'message': 'Email is required'}), 400

    email = data.get('email').lower().strip()
    user = User.find_by_email(get_db(), email)

    if not user:
        # Don't reveal if user exists or not
        return jsonify({
            'message': 'If an account exists with this email, a reset link has been sent.'
        }), 200

    if not user.is_active:
        return jsonify({
            'message': 'If an account exists with this email, a reset link has been sent.'
        }), 200

    # Generate reset token (JWT with custom claim)
    reset_token = create_access_token(
        identity=str(user._id),
        additional_claims={'purpose': 'reset'},
        expires_delta=timedelta(minutes=30)
    )

    # Log the reset link (simulated email)
    reset_link = f"http://localhost:5173/reset-password/{reset_token}"
    logger.info(f"Password reset link for {email}: {reset_link}")
    print(f"=== EMAIL SIMULATION ===")
    print(f"To: {email}")
    print(f"Subject: Password Reset Request")
    print(f"Reset Link: {reset_link}")
    print(f"=======================")

    return jsonify({
        'message': 'If an account exists with this email, a reset link has been sent.'
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using valid token"""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No data provided'}), 400

    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400

    # Decode the token - verifies signature and expiration
    try:
        decoded = decode_token(token)
    except Exception as e:
        return jsonify({'message': 'Invalid or expired token'}), 400

    # Check if token purpose is reset
    if decoded.get('purpose') != 'reset':
        return jsonify({'message': 'Invalid token'}), 400

    user_id = decoded.get('sub')
    user = User.find_by_id(get_db(), user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Update password
    user.set_password(new_password)
    user.save(get_db())

    logger.info(f"Password reset successful for user: {user.email}")

    return jsonify({'message': 'Password has been reset successfully'}), 200