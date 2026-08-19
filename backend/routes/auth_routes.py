from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import jwt
import datetime
import re
from backend.config import Config
from backend.database import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
bcrypt = Bcrypt()

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def is_valid_email(email):
    return re.match(EMAIL_REGEX, email) is not None

def generate_token(user):
    payload = {
        'user_id': user['user_id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

# ----------------------------------------------------
# 1. Registration Endpoint
# ----------------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', password)
    role = data.get('role', 'Operator')
    
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400
        
    if not is_valid_email(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Password and Confirm Password do not match.'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'An account with this email address already exists.'}), 409
        
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    ''', (name, email, password_hash, role))
    
    conn.commit()
    user_id = cursor.lastrowid
    
    cursor.execute("SELECT user_id, name, email, role FROM users WHERE user_id = ?", (user_id,))
    new_user = dict(cursor.fetchone())
    conn.close()
    
    token = generate_token(new_user)
    return jsonify({
        'message': 'Registration successful. You can now log in.',
        'token': token,
        'user': new_user
    }), 201

# ----------------------------------------------------
# 2. Login Endpoint
# ----------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401
        
    user_dict = {
        'user_id': user['user_id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role']
    }
    token = generate_token(user_dict)
    
    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': user_dict
    }), 200

# ----------------------------------------------------
# 3. Forgot Password Endpoint (Original Behavior)
# ----------------------------------------------------
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({
        'message': 'To reset your password, please contact your facility system administrator (alex.vance@hydrofusion.ai).'
    }), 200

# ----------------------------------------------------
# 4. Logout Endpoint
# ----------------------------------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful.'}), 200

# ----------------------------------------------------
# 5. Get Current User Profile Endpoint
# ----------------------------------------------------
@auth_bp.route('/me', methods=['GET'])
def get_me():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthenticated. Token missing.'}), 401
        
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, name, email, role FROM users WHERE user_id = ?", (payload['user_id'],))
        user = cursor.fetchone()
        conn.close()
        if user:
            return jsonify({'user': dict(user)})
        return jsonify({'user': payload})
    except Exception:
        return jsonify({'error': 'Invalid or expired token.'}), 401
