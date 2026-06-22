from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from models import db
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'evelyn-hone-secret-key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'evelyn-hone-jwt-secret-2026')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

    database_url = os.environ.get('DATABASE_URL', 'sqlite:///market.db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, origins='*')
    db.init_app(app)
    jwt = JWTManager(app)

    from routes.auth import auth
    from routes.listings import listings
    from routes.users import users
    from routes.messages import messages
    from routes.ratings import ratings
    from routes.admin import admin
    from routes.reports import reports
    from routes.notifications import notifications
    from routes.categories import categories

    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(listings, url_prefix='/api/listings')
    app.register_blueprint(users, url_prefix='/api/users')
    app.register_blueprint(messages, url_prefix='/api/messages')
    app.register_blueprint(ratings, url_prefix='/api/ratings')
    app.register_blueprint(admin, url_prefix='/api/admin')
    app.register_blueprint(reports, url_prefix='/api/reports')
    app.register_blueprint(notifications, url_prefix='/api/notifications')
    app.register_blueprint(categories, url_prefix='/api/categories')

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'message': 'Not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'message': 'Internal server error'}), 500

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
