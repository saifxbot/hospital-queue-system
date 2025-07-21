"""
Email utilities for 2-factor authentication
"""

from flask_mail import Message
from app.extensions import mail
from flask import current_app, render_template_string
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user_email, verification_code, username):
    """Send verification code email to user"""
    try:
        # HTML email template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hospital Queue System - Verification Code</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f4f7fa;
                    margin: 0;
                    padding: 20px;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: 600;
                }
                .content { 
                    padding: 40px 30px; 
                    text-align: center; 
                }
                .verification-code { 
                    background: #f8f9fa; 
                    border: 2px dashed #667eea; 
                    border-radius: 10px; 
                    font-size: 36px; 
                    font-weight: bold; 
                    color: #667eea; 
                    padding: 20px; 
                    margin: 20px 0; 
                    letter-spacing: 5px;
                    font-family: 'Courier New', monospace;
                }
                .warning { 
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    color: #856404; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    font-size: 14px;
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                    color: #6c757d; 
                    border-top: 1px solid #e9ecef;
                }
                .security-tips {
                    background: #e7f3ff;
                    border-left: 4px solid #2196F3;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: left;
                }
                .security-tips h3 {
                    color: #1976D2;
                    margin-top: 0;
                    font-size: 16px;
                }
                .security-tips ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .security-tips li {
                    margin: 5px 0;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 Hospital Queue System</h1>
                    <p>Two-Factor Authentication</p>
                </div>
                
                <div class="content">
                    <h2>Hello, {{ username }}! 👋</h2>
                    <p>You've requested to log in to your Hospital Queue System account. To complete your login, please use the verification code below:</p>
                    
                    <div class="verification-code">{{ verification_code }}</div>
                    
                    <div class="warning">
                        ⚠️ <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this login, please ignore this email and ensure your account is secure.
                    </div>
                    
                    <div class="security-tips">
                        <h3>🔒 Security Tips:</h3>
                        <ul>
                            <li>Never share this code with anyone</li>
                            <li>Our staff will never ask for this code</li>
                            <li>Always verify you're on the official website</li>
                            <li>If you suspect suspicious activity, contact support immediately</li>
                        </ul>
                    </div>
                    
                    <p>If you're having trouble logging in, please contact our support team.</p>
                </div>
                
                <div class="footer">
                    <p>© 2025 Hospital Queue System | Secure Healthcare Management</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>Generated at: {{ timestamp }}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version for email clients that don't support HTML
        text_template = """
        Hospital Queue System - Verification Code
        
        Hello, {{ username }}!
        
        You've requested to log in to your Hospital Queue System account.
        
        Your verification code is: {{ verification_code }}
        
        This code will expire in 10 minutes.
        
        If you didn't request this login, please ignore this email.
        
        Security Tips:
        - Never share this code with anyone
        - Our staff will never ask for this code
        - Always verify you're on the official website
        
        © 2025 Hospital Queue System
        """
        
        from datetime import datetime
        
        # Render templates with data
        html_body = render_template_string(html_template, 
                                         verification_code=verification_code,
                                         username=username,
                                         timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"))
        
        text_body = render_template_string(text_template,
                                         verification_code=verification_code,
                                         username=username)
        
        # Create and send email
        msg = Message(
            subject="🏥 Hospital Queue System - Your Verification Code",
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[user_email],
            body=text_body,
            html=html_body
        )
        
        mail.send(msg)
        logger.info(f"Verification email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {user_email}: {str(e)}")
        return False

def send_account_locked_email(user_email, username, unlock_time):
    """Send email notification when account is locked"""
    try:
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Account Security Alert</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🚨 Account Security Alert</h2>
                <div class="alert">
                    <p>Hello {{ username }},</p>
                    <p>Your Hospital Queue System account has been temporarily locked due to multiple failed login attempts.</p>
                    <p><strong>Account will be unlocked at:</strong> {{ unlock_time }}</p>
                    <p>If this wasn't you, please contact our support team immediately.</p>
                </div>
                <p>Thank you for helping us keep your account secure.</p>
                <p>Hospital Queue System Security Team</p>
            </div>
        </body>
        </html>
        """
        
        html_body = render_template_string(html_template,
                                         username=username,
                                         unlock_time=unlock_time.strftime("%Y-%m-%d %H:%M:%S UTC"))
        
        msg = Message(
            subject="🚨 Account Security Alert - Account Temporarily Locked",
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[user_email],
            html=html_body
        )
        
        mail.send(msg)
        logger.info(f"Account locked notification sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send account locked email to {user_email}: {str(e)}")
        return False

def test_email_configuration():
    """Test email configuration"""
    try:
        config = current_app.config
        required_settings = ['MAIL_SERVER', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD']
        
        missing_settings = [setting for setting in required_settings if not config.get(setting)]
        
        if missing_settings:
            return False, f"Missing email configuration: {', '.join(missing_settings)}"
        
        return True, "Email configuration looks good"
        
    except Exception as e:
        return False, f"Error checking email configuration: {str(e)}"


def send_password_reset_email(user_email, reset_code, username):
    """Send password reset code email to user"""
    try:
        # HTML email template for password reset code
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hospital Queue System - Password Reset Code</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f4f7fa;
                    margin: 0;
                    padding: 20px;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: 600;
                }
                .content { 
                    padding: 40px 30px; 
                }
                .reset-code {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px;
                    margin: 20px 0;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 Password Reset Code</h1>
                </div>
                <div class="content">
                    <h2>Hello {{ username }}!</h2>
                    <p>We received a request to reset your password for your Hospital Queue System account.</p>
                    
                    <p>Use the following code to reset your password:</p>
                    
                    <div class="reset-code">{{ reset_code }}</div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This code will expire in 1 hour</li>
                            <li>Enter this code on the reset password page</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password will remain unchanged until you create a new one</li>
                        </ul>
                    </div>
                    
                    <p><strong>How to use this code:</strong></p>
                    <ol>
                        <li>Go to the "Forgot Password" page on the Hospital Queue System</li>
                        <li>Enter your email address</li>
                        <li>Enter the reset code: <strong>{{ reset_code }}</strong></li>
                        <li>Create your new password</li>
                    </ol>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>Hospital Queue System Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© 2025 Hospital Queue System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Render template with variables
        html_content = render_template_string(html_template, 
                                            username=username, 
                                            reset_code=reset_code)
        
        # Plain text version
        text_content = f"""
        Hello {username}!
        
        We received a request to reset your password for your Hospital Queue System account.
        
        Use the following code to reset your password:
        
        RESET CODE: {reset_code}
        
        SECURITY NOTICE:
        - This code will expire in 1 hour
        - Enter this code on the reset password page
        - If you didn't request this reset, please ignore this email
        - Your password will remain unchanged until you create a new one
        
        How to use this code:
        1. Go to the "Forgot Password" page on the Hospital Queue System
        2. Enter your email address
        3. Enter the reset code: {reset_code}
        4. Create your new password
        
        If you have any questions, please contact our support team.
        
        Best regards,
        Hospital Queue System Team
        
        ---
        This is an automated message. Please do not reply to this email.
        """
        
        # Create and send email
        msg = Message(
            subject="Password Reset - Hospital Queue System",
            recipients=[user_email],
            html=html_content,
            body=text_content
        )
        
        mail.send(msg)
        logger.info(f"Password reset email sent successfully to {user_email}")
        return True, "Password reset email sent successfully"
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_email}: {str(e)}")
        return False, f"Failed to send email: {str(e)}"
