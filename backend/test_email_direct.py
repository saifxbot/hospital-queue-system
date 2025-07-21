#!/usr/bin/env python3
"""
Direct email test script to debug Gmail SMTP issues
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gmail_direct():
    """Test Gmail SMTP connection directly"""
    
    # Get credentials from .env
    mail_username = os.getenv('MAIL_USERNAME')
    mail_password = os.getenv('MAIL_PASSWORD')
    
    print(f"Testing Gmail SMTP with:")
    print(f"Username: {mail_username}")
    print(f"Password: {'*' * len(mail_password) if mail_password else 'Not found'}")
    print(f"Password length: {len(mail_password) if mail_password else 0}")
    
    try:
        # Create SMTP connection
        print("\n1. Creating SMTP connection...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        
        print("2. Starting TLS...")
        server.starttls()
        
        print("3. Attempting login...")
        server.login(mail_username, mail_password)
        
        print("4. Creating test message...")
        msg = MIMEMultipart()
        msg['From'] = mail_username
        msg['To'] = mail_username
        msg['Subject'] = "Test Email from Hospital System"
        
        body = "This is a test email to verify Gmail SMTP configuration."
        msg.attach(MIMEText(body, 'plain'))
        
        print("5. Sending test email...")
        text = msg.as_string()
        server.sendmail(mail_username, mail_username, text)
        
        print("6. Closing connection...")
        server.quit()
        
        print("\n✅ SUCCESS: Email sent successfully!")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ AUTHENTICATION ERROR: {e}")
        print("\nPossible solutions:")
        print("1. Verify 2-step verification is enabled")
        print("2. Generate a new app password")
        print("3. Use the exact 16-character app password (no spaces)")
        return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_gmail_direct()
