import smtplib
import logging
from email.message import EmailMessage
# pyrefly: ignore [missing-import]
from backend.config import Config

logger = logging.getLogger(__name__)

def send_verification_email(to_email: str, user_name: str, verification_token: str) -> bool:
    """
    Sends a verification email to a newly registered user's email address.
    If SMTP credentials are not configured, logs the verification token safely.
    """
    verification_link = f"{Config.FRONTEND_URL}?verify_token={verification_token}"
    
    subject = "HydroFusion AI - Please Verify Your Email Address"
    body = f"""Hello {user_name},

Welcome to HydroFusion AI – Data Center Cooling & Water Management System.

Please verify your email address to activate your account and complete registration.

Verification Token: {verification_token}
Direct Verification Link: {verification_link}

If you did not request this registration, please ignore this email.

Best regards,
HydroFusion AI Operational Team
Configured Administrator: {Config.ADMIN_EMAIL}
"""

    if Config.EMAIL_USERNAME and Config.EMAIL_PASSWORD:
        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            from_name = getattr(Config, 'EMAIL_FROM_NAME', 'HydroFusion-AI')
            msg['From'] = f"{from_name} <{Config.EMAIL_FROM}>"
            msg['To'] = to_email

            with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            print(f"[EMAIL SERVICE] Verification email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE WARNING] Failed to send SMTP email to {to_email}: {e}")
            return False
    else:
        print(f"[EMAIL SERVICE DEMO LOG] Verification email requested for {to_email}")
        return True

def send_login_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit login verification OTP to the login user's email address via SMTP.
    Sender appears as: HydroFusion-AI <kamalaksha07k@gmail.com>
    """
    subject = "HydroFusion-AI Login Verification Code"
    body = f"""Hello,

Your HydroFusion-AI login verification code is:

{otp_code}

This code expires in 5 minutes.

If you did not attempt to sign in, you can safely ignore this email.

Regards,
HydroFusion-AI
"""

    if Config.EMAIL_USERNAME and Config.EMAIL_PASSWORD:
        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            from_name = getattr(Config, 'EMAIL_FROM_NAME', 'HydroFusion-AI')
            msg['From'] = f"{from_name} <{Config.EMAIL_FROM}>"
            msg['To'] = to_email

            with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            print(f"[EMAIL SERVICE] Login OTP email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE WARNING] Failed to send Login OTP email to {to_email}: {e}")
    else:
        print(f"[EMAIL SERVICE DEMO LOG] Login OTP requested for {to_email}")
        return True

def send_registration_verification_email(to_email: str, verification_code: str) -> bool:

    """
    Sends a 6-digit registration verification email code to a newly registered user via SMTP.
    Sender appears as: HydroFusion-AI <kamalaksha07k@gmail.com>
    """
    subject = "HydroFusion-AI Email Verification Code"
    body = f"""Hello,

Welcome to HydroFusion-AI.

Your email verification code is:

{verification_code}

This code will expire in 10 minutes.

Enter this code on the HydroFusion-AI website to verify your email address.

If you did not create this account, please ignore this email.

Regards,
HydroFusion-AI
"""

    if Config.EMAIL_USERNAME and Config.EMAIL_PASSWORD:
        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            from_name = getattr(Config, 'EMAIL_FROM_NAME', 'HydroFusion-AI')
            msg['From'] = f"{from_name} <{Config.EMAIL_FROM}>"
            msg['To'] = to_email

            with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            print(f"[EMAIL SERVICE] Registration verification email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE WARNING] Failed to send Registration verification email to {to_email}: {e}")
            return False
    else:
        print(f"[EMAIL SERVICE DEMO LOG] Registration verification requested for {to_email}")
        return True

def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Sends a secure password reset email containing a reset link to the user.
    Sender appears as: HydroFusion-AI <kamalaksha07k@gmail.com>
    """
    reset_link = f"{Config.FRONTEND_URL}?reset_token={reset_token}"
    
    subject = "HydroFusion AI - Password Reset"
    body = f"""Hello,

We received a request to reset your HydroFusion AI password.

Click the link below or paste it into your browser to create a new password:

{reset_link}

This password reset link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

Regards,
HydroFusion AI
The Digital Chemist
"""

    if Config.EMAIL_USERNAME and Config.EMAIL_PASSWORD:
        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            from_name = getattr(Config, 'EMAIL_FROM_NAME', 'HydroFusion-AI')
            msg['From'] = f"{from_name} <{Config.EMAIL_FROM}>"
            msg['To'] = to_email

            with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            print(f"[EMAIL SERVICE] Password reset email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE WARNING] Failed to send Password Reset email to {to_email}: {e}")
            return False
    else:
        print(f"[EMAIL SERVICE DEMO LOG] Password reset email requested for {to_email} with link {reset_link}")
        return True



