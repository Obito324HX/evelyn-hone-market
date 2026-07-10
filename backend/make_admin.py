"""
One-off script to promote an existing user to admin.

Usage:
    python make_admin.py your@email.com

Run this once, locally or via your host's shell (e.g. Render's Shell tab),
against whichever database your app is actually using. The user must
already have a real account (register normally through the app first).
"""
import sys
from app import create_app
from models import db, User

def main():
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <email>")
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    app = create_app()

    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"No user found with email: {email}")
            print("Register an account with this email in the app first, then run this again.")
            sys.exit(1)

        user.is_admin = True
        db.session.commit()
        print(f"Done. {user.username} ({user.email}) is now an admin.")
        print("They can log in at /admin using their normal account email + password.")

if __name__ == '__main__':
    main()
