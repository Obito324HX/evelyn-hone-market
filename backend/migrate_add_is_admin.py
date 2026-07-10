"""
One-off migration: adds the is_admin column to the user table.

Safe to run more than once — checks if the column already exists first.
Works against whichever database your app is actually configured for
(reads the same DATABASE_URL / config your app.py uses), so run this
once locally against your dev database, and once in production
(e.g. Render's Shell tab) against your real database.

Usage:
    python migrate_add_is_admin.py
"""
from sqlalchemy import inspect, text
from app import create_app
from models import db

def main():
    app = create_app()

    with app.app_context():
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('user')]

        if 'is_admin' in columns:
            print("Column 'is_admin' already exists — nothing to do.")
            return

        print("Adding 'is_admin' column to the user table...")
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE "user" ADD COLUMN is_admin BOOLEAN DEFAULT FALSE'))
            conn.commit()

        print("Done. Every existing user now has is_admin = False by default.")
        print("Next, run: python make_admin.py your-email@example.com")

if __name__ == '__main__':
    main()
