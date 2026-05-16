"""
Pytest test cases for backend auth endpoints.
Run with: pytest test_auth.py -v
"""
import pytest
from app import create_app
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta


@pytest.fixture
def app():
    """Create test app"""
    app = create_app('testing')
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def auth_tokens(app):
    """Create valid auth tokens for testing"""
    with app.app_context():
        from app.models import User

        # Find the super admin user
        user = User.find_by_email(app.db, 'super@taskflow.com')
        if not user:
            # Create if doesn't exist
            user = User(email='super@taskflow.com', role=User.ROLE_SUPER_ADMIN)
            user.set_password('SuperAdmin123')
            user.save(app.db)

        access_token = create_access_token(
            identity=str(user._id),
            additional_claims={'role': user.role, 'company_id': user.company_id},
            expires_delta=timedelta(hours=1)
        )
        refresh_token = create_refresh_token(
            identity=str(user._id),
            expires_delta=timedelta(days=7)
        )

        return {
            'user_id': str(user._id),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'email': user.email,
            'password': 'SuperAdmin123'
        }


# ==================== LOGIN TESTS ====================

class TestLogin:
    """Test POST /api/auth/login"""

    def test_login_success(self, client, auth_tokens):
        """Test successful login returns tokens and user"""
        response = client.post('/api/auth/login', json={
            'email': auth_tokens['email'],
            'password': auth_tokens['password']
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert 'user' in data
        assert data['user']['email'] == auth_tokens['email']
        assert data['user']['role'] == 'super_admin'

    def test_login_invalid_email(self, client):
        """Test login with non-existent email"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })

        assert response.status_code == 401
        assert 'Invalid email or password' in response.get_json()['message']

    def test_login_invalid_password(self, client, auth_tokens):
        """Test login with wrong password"""
        response = client.post('/api/auth/login', json={
            'email': auth_tokens['email'],
            'password': 'wrongpassword'
        })

        assert response.status_code == 401
        assert 'Invalid email or password' in response.get_json()['message']

    def test_login_missing_email(self, client):
        """Test login with missing email"""
        response = client.post('/api/auth/login', json={
            'password': 'password123'
        })

        assert response.status_code == 400
        assert 'Email and password are required' in response.get_json()['message']

    def test_login_missing_password(self, client):
        """Test login with missing password"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com'
        })

        assert response.status_code == 400

    def test_login_inactive_user(self, app, client, auth_tokens):
        """Test login with inactive user"""
        with app.app_context():
            from app.models import User
            user = User.find_by_email(app.db, auth_tokens['email'])
            user.is_active = False
            user.save(app.db)

            response = client.post('/api/auth/login', json={
                'email': auth_tokens['email'],
                'password': auth_tokens['password']
            })

            assert response.status_code == 401
            assert 'inactive' in response.get_json()['message'].lower()

            # Reactivate for other tests
            user.is_active = True
            user.save(app.db)


# ==================== REFRESH TOKEN TESTS ====================

class TestRefreshToken:
    """Test POST /api/auth/refresh"""

    def test_refresh_success(self, client, auth_tokens):
        """Test successful token refresh"""
        response = client.post('/api/auth/refresh', headers={
            'Authorization': f'Bearer {auth_tokens["refresh_token"]}'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data

    def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token"""
        response = client.post('/api/auth/refresh', headers={
            'Authorization': 'Bearer invalid_token'
        })

        # Flask-JWT-Extended returns 422 for invalid JWT
        assert response.status_code in [401, 422]

    def test_refresh_access_token(self, client, auth_tokens):
        """Test using access token for refresh (should fail)"""
        response = client.post('/api/auth/refresh', headers={
            'Authorization': f'Bearer {auth_tokens["access_token"]}'
        })

        assert response.status_code in [401, 422]


# ==================== FORGOT PASSWORD TESTS ====================

class TestForgotPassword:
    """Test POST /api/auth/forgot-password"""

    def test_forgot_password_existing_user(self, client, auth_tokens):
        """Test forgot password for existing user"""
        response = client.post('/api/auth/forgot-password', json={
            'email': auth_tokens['email']
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'reset link has been sent' in data['message'].lower()

    def test_forgot_password_nonexistent_user(self, client):
        """Test forgot password for non-existent user (should not reveal)"""
        response = client.post('/api/auth/forgot-password', json={
            'email': 'nonexistent@example.com'
        })

        assert response.status_code == 200
        data = response.get_json()
        # Should show same message as for existing user
        assert 'reset link has been sent' in data['message'].lower()

    def test_forgot_password_missing_email(self, client):
        """Test forgot password with missing email"""
        response = client.post('/api/auth/forgot-password', json={})

        assert response.status_code == 400
        assert 'Email is required' in response.get_json()['message']


# ==================== RESET PASSWORD TESTS ====================

class TestResetPassword:
    """Test POST /api/auth/reset-password"""

    def test_reset_password_success(self, app, client, auth_tokens):
        """Test successful password reset"""
        from app.models import User

        # Generate a valid reset token
        with app.app_context():
            reset_token = create_access_token(
                identity=auth_tokens['user_id'],
                additional_claims={'purpose': 'reset'},
                expires_delta=timedelta(minutes=30)
            )

            response = client.post('/api/auth/reset-password', json={
                'token': reset_token,
                'password': 'NewPassword123'
            })

            assert response.status_code == 200
            assert 'successfully' in response.get_json()['message'].lower()

            # Verify new password works
            user = User.find_by_id(app.db, auth_tokens['user_id'])
            assert user.check_password('NewPassword123')

            # Reset to original password
            user.set_password(auth_tokens['password'])
            user.save(app.db)

    def test_reset_password_invalid_token(self, client):
        """Test reset with invalid token"""
        response = client.post('/api/auth/reset-password', json={
            'token': 'invalid_token',
            'password': 'NewPassword123'
        })

        assert response.status_code == 400
        assert 'Invalid or expired token' in response.get_json()['message']

    def test_reset_password_expired_token(self, app, client, auth_tokens):
        """Test reset with expired token"""
        with app.app_context():
            # Generate expired token
            expired_token = create_access_token(
                identity=auth_tokens['user_id'],
                additional_claims={'purpose': 'reset'},
                expires_delta=timedelta(seconds=-1)  # Already expired
            )

            response = client.post('/api/auth/reset-password', json={
                'token': expired_token,
                'password': 'NewPassword123'
            })

            assert response.status_code == 400

    def test_reset_password_wrong_purpose(self, app, client, auth_tokens):
        """Test reset with token that has wrong purpose"""
        with app.app_context():
            # Generate token with different purpose
            wrong_purpose_token = create_access_token(
                identity=auth_tokens['user_id'],
                additional_claims={'purpose': 'other'},
                expires_delta=timedelta(minutes=30)
            )

            response = client.post('/api/auth/reset-password', json={
                'token': wrong_purpose_token,
                'password': 'NewPassword123'
            })

            assert response.status_code == 400
            assert 'Invalid token' in response.get_json()['message']

    def test_reset_password_missing_fields(self, client):
        """Test reset with missing fields"""
        response = client.post('/api/auth/reset-password', json={})

        assert response.status_code == 400
        # Check for either "required" or "no data provided"
        msg = response.get_json()['message'].lower()
        assert 'required' in msg or 'no data' in msg


# ==================== CHANGE PASSWORD TESTS ====================

class TestChangePassword:
    """Test POST /api/auth/change-password"""

    def test_change_password_success(self, app, client, auth_tokens):
        """Test successful password change"""
        from app.models import User

        response = client.post('/api/auth/change-password',
            headers={'Authorization': f'Bearer {auth_tokens["access_token"]}'},
            json={
                'old_password': auth_tokens['password'],
                'new_password': 'ChangedPassword123'
            }
        )

        assert response.status_code == 200
        assert 'successfully' in response.get_json()['message'].lower()

        # Verify new password works
        with app.app_context():
            user = User.find_by_id(app.db, auth_tokens['user_id'])
            assert user.check_password('ChangedPassword123')

            # Reset to original
            user.set_password(auth_tokens['password'])
            user.save(app.db)

    def test_change_password_wrong_old(self, client, auth_tokens):
        """Test change password with wrong old password"""
        response = client.post('/api/auth/change-password',
            headers={'Authorization': f'Bearer {auth_tokens["access_token"]}'},
            json={
                'old_password': 'wrongpassword',
                'new_password': 'NewPassword123'
            }
        )

        assert response.status_code == 401
        assert 'incorrect' in response.get_json()['message'].lower()

    def test_change_password_unauthorized(self, client):
        """Test change password without auth"""
        response = client.post('/api/auth/change-password', json={
            'old_password': 'old',
            'new_password': 'new'
        })

        assert response.status_code == 401

    def test_change_password_missing_fields(self, client, auth_tokens):
        """Test change password with missing fields"""
        response = client.post('/api/auth/change-password',
            headers={'Authorization': f'Bearer {auth_tokens["access_token"]}'},
            json={'old_password': 'password'}
        )

        assert response.status_code == 400


# ==================== GET ME TESTS ====================

class TestGetMe:
    """Test GET /api/auth/me"""

    def test_me_success(self, client, auth_tokens):
        """Test getting current user info"""
        response = client.get('/api/auth/me',
            headers={'Authorization': f'Bearer {auth_tokens["access_token"]}'}
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['email'] == auth_tokens['email']
        assert data['role'] == 'super_admin'

    def test_me_unauthorized(self, client):
        """Test getting user info without auth"""
        response = client.get('/api/auth/me')

        assert response.status_code == 401