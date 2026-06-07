from flask import Flask
from flask_cors import CORS
from models import db
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'evelyn-hone-secret-key')
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///market.db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, origins='*')
    db.init_app(app)

    from routes.auth import auth
    from routes.listings import listings
    from routes.messages import messages
    from routes.ratings import ratings
    from routes.admin import admin
    from routes.reports import reports
    from routes.notifications import notifications
    from routes.categories import categories

    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(listings, url_prefix='/api/listings')
    app.register_blueprint(messages, url_prefix='/api/messages')
    app.register_blueprint(ratings, url_prefix='/api/ratings')
    app.register_blueprint(admin, url_prefix='/api/admin')
    app.register_blueprint(reports, url_prefix='/api/reports')
    app.register_blueprint(notifications, url_prefix='/api/notifications')
    app.register_blueprint(categories, url_prefix='/api/categories')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
