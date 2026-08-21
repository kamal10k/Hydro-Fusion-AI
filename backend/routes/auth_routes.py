import secrets
from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import]
from flask_bcrypt import Bcrypt
import jwt
import datetime
import hashlib
import re

# pyrefly: ignore [missing-import]
from backend.config import Config
# pyrefly: ignore [missing-import]
from backend.database import get_db_connection
# pyrefly: ignore [missing-import]
from backend.services.email_service import (
    send_verification_email, 
    send_login_otp_email, 
    send_registration_verification_email,
    send_password_reset_email
)



auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
bcrypt = Bcrypt()

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def is_valid_email(email):
    return re.match(EMAIL_REGEX, email) is not None

def mask_email(email):
    if not email or '@' not in email:
        return 'u***@domain.com'
    parts = email.split('@')
    name_part = parts[0]
    domain_part = parts[1]
    if len(name_part) <= 2:
        masked_name = name_part[0] + '*' * max(1, len(name_part) - 1)
    else:
        masked_name = name_part[0] + '*' * (len(name_part) - 2) + name_part[-1]
    return f"{masked_name}@{domain_part}"


def generate_token(user):
    payload = {
        'user_id': user['user_id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'facility_name': user.get('facility_name', 'Facility Alpha'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def get_current_user_from_request(req):
    auth_header = req.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, name, email, role, facility_name, is_verified FROM users WHERE user_id = ?", (payload['user_id'],))
        user_row = cursor.fetchone()
        conn.close()
        if user_row:
            return dict(user_row)
        return payload
    except Exception:
        return None

# ----------------------------------------------------
# 1. Registration Endpoint (Normal Account Creation)
# ----------------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', password)
    role = data.get('role', 'Operator')
    facility_name = data.get('facility_name', 'Facility Alpha').strip() or 'Facility Alpha'
    
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
    
    # Create new account with is_verified = 0 (unverified)
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, facility_name, is_verified)
        VALUES (?, ?, ?, ?, ?, 0)
    ''', (name, email, password_hash, role, facility_name))
    
    conn.commit()
    user_id = cursor.lastrowid
    
    # Generate 6-digit numeric verification code (10-minute expiration)
    verification_code = f"{secrets.randbelow(900000) + 100000}"
    registration_token = secrets.token_urlsafe(24)
    code_hash = bcrypt.generate_password_hash(verification_code).decode('utf-8')
    expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute('''
        INSERT INTO registration_verifications (registration_token, user_id, code_hash, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (registration_token, user_id, code_hash, expires_at))
    conn.commit()
    conn.close()

    # Send Registration Verification Email
    send_registration_verification_email(email, verification_code)

    email_masked = mask_email(email)
    return jsonify({
        'message': f'Registration successful! A verification code was sent to {email_masked}.',
        'requires_verification': True,
        'registration_token': registration_token,
        'email': email,
        'email_masked': email_masked
    }), 201

# ----------------------------------------------------
# 2. Registration Email Verification Endpoint
# ----------------------------------------------------
@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json() or {}
    registration_token = data.get('registration_token', '').strip()
    code = data.get('code', '').strip()
    email = data.get('email', '').strip().lower()

    if not code:
        return jsonify({'error': '6-digit verification code is required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    if registration_token:
        cursor.execute("SELECT * FROM registration_verifications WHERE registration_token = ?", (registration_token,))
    elif email:
        cursor.execute("SELECT v.* FROM registration_verifications v JOIN users u ON v.user_id = u.user_id WHERE u.email = ? ORDER BY v.verification_id DESC LIMIT 1", (email,))
    else:
        conn.close()
        return jsonify({'error': 'Registration token or email address is required.'}), 400

    rec = cursor.fetchone()
    if not rec or rec['used'] == 1:
        conn.close()
        return jsonify({'error': 'Invalid or expired verification attempt.'}), 400

    # Attempt count limit (5 attempts)
    if rec['attempt_count'] >= 5:
        cursor.execute("UPDATE registration_verifications SET used = 1 WHERE verification_id = ?", (rec['verification_id'],))
        conn.commit()
        conn.close()
        return jsonify({'error': 'Too many verification attempts. Please request a new code.'}), 400

    # Increment attempt count
    cursor.execute("UPDATE registration_verifications SET attempt_count = attempt_count + 1 WHERE verification_id = ?", (rec['verification_id'],))
    conn.commit()

    # Check expiration (10 minutes)
    expires_at = datetime.datetime.strptime(rec['expires_at'], '%Y-%m-%d %H:%M:%S')
    if datetime.datetime.utcnow() > expires_at:
        cursor.execute("UPDATE registration_verifications SET used = 1 WHERE verification_id = ?", (rec['verification_id'],))
        conn.commit()
        conn.close()
        return jsonify({'error': 'Verification code has expired. Please request a new code.'}), 400

    # Check verification code hash
    if not bcrypt.check_password_hash(rec['code_hash'], code):
        conn.close()
        return jsonify({'error': 'Invalid verification code. Please check and try again.'}), 400

    # SUCCESS: Mark verification code used and verify user account
    cursor.execute("UPDATE registration_verifications SET used = 1 WHERE verification_id = ?", (rec['verification_id'],))
    cursor.execute("UPDATE users SET is_verified = 1 WHERE user_id = ?", (rec['user_id'],))
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Email address verified successfully. You may now sign in.',
        'verified': True
    }), 200

# ----------------------------------------------------
# 2.1 Resend Registration Verification Endpoint
# ----------------------------------------------------
@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json() or {}
    registration_token = data.get('registration_token', '').strip()
    email = data.get('email', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    if registration_token:
        cursor.execute("SELECT * FROM registration_verifications WHERE registration_token = ?", (registration_token,))
    elif email:
        cursor.execute("SELECT v.* FROM registration_verifications v JOIN users u ON v.user_id = u.user_id WHERE u.email = ? ORDER BY v.verification_id DESC LIMIT 1", (email,))
    else:
        conn.close()
        return jsonify({'error': 'Registration token or email address is required.'}), 400

    rec = cursor.fetchone()
    if not rec:
        conn.close()
        return jsonify({'error': 'Invalid verification request.'}), 400

    # 60-second cooldown check
    created_at = datetime.datetime.strptime(rec['created_at'], '%Y-%m-%d %H:%M:%S')
    time_since = (datetime.datetime.utcnow() - created_at).total_seconds()
    if time_since < 60:
        remaining = int(60 - time_since)
        conn.close()
        return jsonify({'error': f'Please wait {remaining} seconds before requesting a new verification code.'}), 429

    # Invalidate previous code
    cursor.execute("UPDATE registration_verifications SET used = 1 WHERE verification_id = ?", (rec['verification_id'],))

    # Fetch user
    cursor.execute("SELECT user_id, email FROM users WHERE user_id = ?", (rec['user_id'],))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User account not found.'}), 404

    # Generate new registration verification code
    new_code = f"{secrets.randbelow(900000) + 100000}"
    new_registration_token = secrets.token_urlsafe(24)
    new_hash = bcrypt.generate_password_hash(new_code).decode('utf-8')
    new_expires = (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute('''
        INSERT INTO registration_verifications (registration_token, user_id, code_hash, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (new_registration_token, user['user_id'], new_hash, new_expires))
    conn.commit()
    conn.close()

    send_registration_verification_email(user['email'], new_code)

    email_masked = mask_email(user['email'])
    return jsonify({
        'message': f'A new verification code has been sent to {email_masked}.',
        'registration_token': new_registration_token,
        'email_masked': email_masked
    }), 200

# ----------------------------------------------------
# 3. Login Endpoint (Format -> Exists -> Password Check -> Verification Check)
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
    
    # 1. Check if email exists in database
    if not user:
        conn.close()
        return jsonify({'error': 'Email does not exist. Please check your email address or register a new account.', 'code': 'EMAIL_NOT_FOUND'}), 404

    # 2. Check password
    if not bcrypt.check_password_hash(user['password_hash'], password):
        conn.close()
        return jsonify({'error': 'Incorrect email or password.', 'code': 'INVALID_PASSWORD'}), 401
        
    # 3. Check registration email verification status
    if user['is_verified'] == 0:
        conn.close()
        return jsonify({'error': 'Please verify your email before signing in.', 'code': 'UNVERIFIED_EMAIL'}), 403


        
    # 3. Generate 6-digit numeric OTP and login_attempt_id
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    login_attempt_id = secrets.token_urlsafe(24)
    otp_hash = bcrypt.generate_password_hash(otp_code).decode('utf-8')
    expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M:%S')

    # Store OTP record in database
    cursor.execute('''
        INSERT INTO login_otps (login_attempt_id, user_id, otp_hash, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (login_attempt_id, user['user_id'], otp_hash, expires_at))
    conn.commit()
    conn.close()


    # Send OTP email to user's registered email address
    email_sent = send_login_otp_email(user['email'], otp_code)
    if not email_sent:
        return jsonify({'error': 'Failed to send verification email. Please try again.'}), 500

    email_masked = mask_email(user['email'])
    return jsonify({
        'message': f'Verification code sent to {email_masked}.',
        'requires_otp': True,
        'login_attempt_id': login_attempt_id,
        'email_masked': email_masked
    }), 200

# ----------------------------------------------------
# 3.1. Verify Login OTP Endpoint
# ----------------------------------------------------
@auth_bp.route('/verify-login-otp', methods=['POST'])
def verify_login_otp():
    data = request.get_json() or {}
    login_attempt_id = data.get('login_attempt_id', '').strip()
    otp = data.get('otp', '').strip()

    if not login_attempt_id or not otp:
        return jsonify({'error': 'Login attempt ID and 6-digit OTP code are required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM login_otps WHERE login_attempt_id = ?", (login_attempt_id,))
    otp_record = cursor.fetchone()

    if not otp_record or otp_record['used'] == 1:
        conn.close()
        return jsonify({'error': 'Invalid verification attempt or code already used.'}), 400

    # Max attempts check (limit: 5 attempts)
    if otp_record['attempt_count'] >= 5:
        cursor.execute("UPDATE login_otps SET used = 1 WHERE otp_id = ?", (otp_record['otp_id'],))
        conn.commit()
        conn.close()
        return jsonify({'error': 'Maximum verification attempts exceeded. Please sign in again.'}), 400

    # Increment attempt count
    cursor.execute("UPDATE login_otps SET attempt_count = attempt_count + 1 WHERE otp_id = ?", (otp_record['otp_id'],))
    conn.commit()

    # Check expiration (5 minutes)
    expires_at = datetime.datetime.strptime(otp_record['expires_at'], '%Y-%m-%d %H:%M:%S')
    if datetime.datetime.utcnow() > expires_at:
        cursor.execute("UPDATE login_otps SET used = 1 WHERE otp_id = ?", (otp_record['otp_id'],))
        conn.commit()
        conn.close()
        return jsonify({'error': 'Verification code has expired. Please request a new code.'}), 400

    # Verify OTP hash
    if not bcrypt.check_password_hash(otp_record['otp_hash'], otp):
        conn.close()
        return jsonify({'error': 'Invalid verification code. Please check and try again.'}), 400

    # Mark OTP used
    cursor.execute("UPDATE login_otps SET used = 1 WHERE otp_id = ?", (otp_record['otp_id'],))
    conn.commit()

    cursor.execute("SELECT user_id, name, email, role, facility_name, is_verified FROM users WHERE user_id = ?", (otp_record['user_id'],))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'User account not found.'}), 404

    user_dict = dict(user)
    user_dict['is_verified'] = 1
    token = generate_token(user_dict)

    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': user_dict
    }), 200

# ----------------------------------------------------
# 3.2. Resend Login OTP Endpoint
# ----------------------------------------------------
@auth_bp.route('/resend-login-otp', methods=['POST'])
def resend_login_otp():
    data = request.get_json() or {}
    login_attempt_id = data.get('login_attempt_id', '').strip()

    if not login_attempt_id:
        return jsonify({'error': 'Login attempt ID is required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM login_otps WHERE login_attempt_id = ?", (login_attempt_id,))
    otp_record = cursor.fetchone()

    if not otp_record:
        conn.close()
        return jsonify({'error': 'Invalid login attempt.'}), 400

    # 60-second cooldown check
    created_at = datetime.datetime.strptime(otp_record['created_at'], '%Y-%m-%d %H:%M:%S')
    time_since = (datetime.datetime.utcnow() - created_at).total_seconds()
    if time_since < 60:
        remaining = int(60 - time_since)
        conn.close()
        return jsonify({'error': f'Please wait {remaining} seconds before requesting a new verification code.'}), 429

    # Invalidate previous OTP
    cursor.execute("UPDATE login_otps SET used = 1 WHERE otp_id = ?", (otp_record['otp_id'],))

    # Fetch user
    cursor.execute("SELECT user_id, email FROM users WHERE user_id = ?", (otp_record['user_id'],))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User account not found.'}), 404

    # Generate new OTP
    new_otp_code = f"{secrets.randbelow(900000) + 100000}"
    new_login_attempt_id = secrets.token_urlsafe(24)
    new_otp_hash = bcrypt.generate_password_hash(new_otp_code).decode('utf-8')
    new_expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute('''
        INSERT INTO login_otps (login_attempt_id, user_id, otp_hash, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (new_login_attempt_id, user['user_id'], new_otp_hash, new_expires_at))
    conn.commit()
    conn.close()

    send_login_otp_email(user['email'], new_otp_code)

    return jsonify({
        'message': f'A new verification code has been sent to {mask_email(user["email"])}.',
        'login_attempt_id': new_login_attempt_id,
        'email_masked': mask_email(user['email'])
    }), 200



# ----------------------------------------------------
# 4. Forgot Password Endpoint (Secure Token Dispatch)
# ----------------------------------------------------
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email address is required.'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, email FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        # Generate 32-byte cryptographically secure random token
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=15)).strftime('%Y-%m-%d %H:%M:%S')

        # Invalidate old unused reset tokens for this user
        cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0", (user['user_id'],))

        cursor.execute('''
            INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
        ''', (user['user_id'], token_hash, expires_at))
        conn.commit()

        # Dispatch Password Reset Email
        send_password_reset_email(user['email'], raw_token)

    conn.close()

    # Generic response for security (does not reveal if email exists)
    return jsonify({
        'message': 'If an account with this email exists, a password reset link has been sent.'
    }), 200

# ----------------------------------------------------
# 4.1. Reset Password Endpoint (Token Validation & Password Update)
# ----------------------------------------------------
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not token:
        return jsonify({'error': 'Password reset token is required.'}), 400

    if not new_password:
        return jsonify({'error': 'New password is required.'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    if new_password != confirm_password:
        return jsonify({'error': 'Passwords do not match.'}), 400

    # Hash token to look up in DB
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM password_reset_tokens WHERE token_hash = ?", (token_hash,))
    rec = cursor.fetchone()

    if not rec or rec['used'] == 1:
        conn.close()
        return jsonify({'error': 'This password reset link is invalid or has expired. Please request a new password reset link.'}), 400

    # Check expiration (15 minutes)
    expires_at = datetime.datetime.strptime(rec['expires_at'], '%Y-%m-%d %H:%M:%S')
    if datetime.datetime.utcnow() > expires_at:
        cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE reset_id = ?", (rec['reset_id'],))
        conn.commit()
        conn.close()
        return jsonify({'error': 'This password reset link is invalid or has expired. Please request a new password reset link.'}), 400

    # SUCCESS: Update user password hash
    new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    cursor.execute("UPDATE users SET password_hash = ? WHERE user_id = ?", (new_password_hash, rec['user_id']))

    # Mark reset token used
    cursor.execute("UPDATE password_reset_tokens SET used = 1, used_at = CURRENT_TIMESTAMP WHERE reset_id = ?", (rec['reset_id'],))
    
    # Invalidate all remaining open reset tokens for this user
    cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0", (rec['user_id'],))

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Your password has been reset successfully. Please log in with your new password.',
        'success': True
    }), 200


# ----------------------------------------------------
# 5. Logout Endpoint
# ----------------------------------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful.'}), 200

# ----------------------------------------------------
# 6. Get Current User Profile Endpoint
# ----------------------------------------------------
@auth_bp.route('/me', methods=['GET'])
def get_me():
    user = get_current_user_from_request(request)
    if user:
        return jsonify({'user': user})
    return jsonify({'error': 'Unauthenticated. Token missing or invalid.'}), 401



