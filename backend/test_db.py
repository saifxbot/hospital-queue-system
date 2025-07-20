from app import create_app
from app.extensions import db
from app.models import User

app = create_app()
with app.app_context():
    # Check existing users
    users = User.query.all()
    print(f"Users in database: {len(users)}")
    
    for user in users:
        print(f"- {user.username} ({user.email}) - 2FA: {user.two_factor_enabled}")
    
    # Create a test user if none exists with email
    test_user = User.query.filter_by(username="testuser").first()
    if not test_user:
        test_user = User(username="testuser", email="test@example.com", role="patient")
        test_user.set_password("password123")
        test_user.two_factor_enabled = True
        db.session.add(test_user)
        db.session.commit()
        print("Created test user: testuser / password123")
    else:
        print("Test user already exists")
        
    print("\nAll users:")
    for user in User.query.all():
        print(f"- {user.username} ({user.email}) - 2FA: {user.two_factor_enabled}")
