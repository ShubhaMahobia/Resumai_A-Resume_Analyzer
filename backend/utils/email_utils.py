from flask import render_template, current_app
from flask_mail import Message

def send_welcome_email(user):
    """
    Send a welcome email to a newly registered user.
    
    Args:
        user: The user model instance with email and name
    """
    # Get the base URL and ensure it doesn't have a trailing slash
    base_url = current_app.config['FRONTEND_URL'].rstrip('/')
    
    # Generate login link
    login_link = f"{base_url}/"
    
    print(f"Sending welcome email to: {user.email}")
    
    # Create message
    msg = Message(
        "Welcome to Resumai!",
        recipients=[user.email]
    )
    
    # Render the email template with the login link
    msg.html = render_template(
        'emails/welcome_email.html',
        user_name=user.fullName,
        login_link=login_link
    )
    
    # Send the email using the mail extension from current_app
    mail = current_app.extensions['mail']
    mail.send(msg)
    
    return True

def send_password_reset_email(user, reset_token):
    """
    Send a password reset email to a user.
    
    Args:
        user: The user model instance
        reset_token: The password reset token
    """
    # Get the base URL and ensure it doesn't have a trailing slash
    base_url = current_app.config['FRONTEND_URL'].rstrip('/')
    
    # Generate reset link
    reset_url = f"{base_url}/reset-password/{reset_token}"
    
    msg = Message(
        "Resumai - Password Reset Request",
        recipients=[user.email]
    )
    
    msg.html = render_template(
        'emails/password_reset.html',
        user_name=user.fullName,
        reset_link=reset_url
    )
    
    # Send the email using the mail extension from current_app
    mail = current_app.extensions['mail']
    mail.send(msg)
    
    return True 