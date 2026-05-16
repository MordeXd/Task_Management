from datetime import datetime
import bcrypt
from bson import ObjectId


class User:
    """User model for MongoDB"""

    COLLECTION = 'users'

    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_ADMIN = 'admin'
    ROLE_EMPLOYEE = 'employee'

    ROLES = [ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_EMPLOYEE]

    def __init__(
        self,
        email: str,
        password_hash: str = None,
        role: str = ROLE_EMPLOYEE,
        company_id: str = None,
        is_active: bool = True,
        name: str = None,
        created_by: str = None,
        reset_token_hash: str = None,
        reset_token_expiry: datetime = None,
        created_at: datetime = None,
        updated_at: datetime = None,
        _id: ObjectId = None
    ):
        self._id = _id
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.company_id = company_id
        self.is_active = is_active
        self.name = name
        self.created_by = created_by
        self.reset_token_hash = reset_token_hash
        self.reset_token_expiry = reset_token_expiry
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def set_password(self, password: str) -> None:
        """Hash and set the password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """Verify the password"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def set_reset_token(self, token: str) -> None:
        """Hash and set the reset token"""
        salt = bcrypt.gensalt()
        self.reset_token_hash = bcrypt.hashpw(token.encode('utf-8'), salt).decode('utf-8')
        self.reset_token_expiry = datetime.utcnow()

    def check_reset_token(self, token: str) -> bool:
        """Verify the reset token"""
        if not self.reset_token_hash or not self.reset_token_expiry:
            return False
        # Check if token has expired
        if datetime.utcnow() > self.reset_token_expiry:
            return False
        return bcrypt.checkpw(token.encode('utf-8'), self.reset_token_hash.encode('utf-8'))

    def clear_reset_token(self) -> None:
        """Clear the reset token"""
        self.reset_token_hash = None
        self.reset_token_expiry = None

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON response"""
        data = {
            'email': self.email,
            'role': self.role,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'name': self.name,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if self._id:
            data['_id'] = str(self._id)
        return data

    @classmethod
    def from_dict(cls, data: dict) -> 'User':
        """Create User from dictionary"""
        return cls(
            _id=data.get('_id'),
            email=data.get('email'),
            password_hash=data.get('password_hash'),
            role=data.get('role', cls.ROLE_EMPLOYEE),
            company_id=data.get('company_id'),
            is_active=data.get('is_active', True),
            name=data.get('name'),
            created_by=data.get('created_by'),
            reset_token_hash=data.get('reset_token_hash'),
            reset_token_expiry=data.get('reset_token_expiry'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )

    def save(self, db) -> 'User':
        """Save user to database"""
        now = datetime.utcnow()
        self.updated_at = now

        user_data = {
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'name': self.name,
            'created_by': self.created_by,
            'reset_token_hash': self.reset_token_hash,
            'reset_token_expiry': self.reset_token_expiry,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

        if self._id:
            db.users.update_one(
                {'_id': self._id},
                {'$set': user_data}
            )
        else:
            result = db.users.insert_one(user_data)
            self._id = result.inserted_id

        return self

    @classmethod
    def find_by_email(cls, db, email: str) -> 'User':
        """Find user by email"""
        data = db.users.find_one({'email': email})
        if data:
            return cls.from_dict(data)
        return None

    @classmethod
    def find_by_id(cls, db, user_id: str) -> 'User':
        """Find user by ID"""
        try:
            data = db.users.find_one({'_id': ObjectId(user_id)})
            if data:
                return cls.from_dict(data)
        except Exception:
            pass
        return None

    @classmethod
    def find_by_email_exact(cls, db, email: str) -> 'User':
        """Find user by exact email (case-sensitive)"""
        return cls.find_by_email(db, email)

    @classmethod
    def count(cls, db) -> int:
        """Count total users"""
        return db.users.count_documents({})

    @classmethod
    def is_super_admin(cls, email: str) -> bool:
        """Check if email belongs to super admin"""
        return email == 'super@taskflow.com'