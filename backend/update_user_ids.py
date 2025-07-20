"""
Script to populate user_id field for existing users
Run this once after the migration to assign user_ids to existing users
"""
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()
with app.app_context():
    # Check if there are users without user_id
    users_without_id = User.query.filter_by(user_id=None).all()
    
    if not users_without_id:
        print("All users already have user_ids assigned!")
        # Show current users
        all_users = User.query.all()
        print(f"\nCurrent users ({len(all_users)}):")
        for user in all_users:
            print(f"- ID: {user.id}, User ID: {user.user_id}, Name: {user.username}, Email: {user.email}")
    else:
        print(f"Found {len(users_without_id)} users without user_id. Assigning IDs...")
        
        for user in users_without_id:
            # Generate a unique user_id based on their database ID
            user_id = f"USER{user.id:04d}"  # USER0001, USER0002, etc.
            
            # Check if this user_id already exists
            existing = User.query.filter_by(user_id=user_id).first()
            counter = 1
            original_user_id = user_id
            while existing:
                user_id = f"{original_user_id}_{counter}"
                existing = User.query.filter_by(user_id=user_id).first()
                counter += 1
            
            user.user_id = user_id
            print(f"Assigned user_id '{user_id}' to user '{user.username}' (ID: {user.id})")
        
        db.session.commit()
        print(f"\nSuccessfully assigned user_ids to {len(users_without_id)} users!")
        
        # Show updated users
        all_users = User.query.all()
        print(f"\nAll users ({len(all_users)}):")
        for user in all_users:
            print(f"- ID: {user.id}, User ID: {user.user_id}, Name: {user.username}, Email: {user.email}")
