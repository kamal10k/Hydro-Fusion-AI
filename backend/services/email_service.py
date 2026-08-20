import smtplib
import logging
from email.message import EmailMessage
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
            msg['From'] = Config.EMAIL_FROM
            msg['To'] = to_email

            with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            print(f"[EMAIL SERVICE] Verification email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL SERVICE WARNING] Failed to send SMTP email to {to_email}: {e}")
            print(f"[EMAIL SERVICE LOG] Verification Token for {to_email}: {verification_token}")
            return False
    else:
        print(f"[EMAIL SERVICE DEMO LOG] Verification email to {to_email} with token: {verification_token}")
        print(f"[EMAIL SERVICE DEMO LINK] Link: {verification_link}")
        return True
