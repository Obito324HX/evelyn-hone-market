from flask import Blueprint, jsonify
from models import User

users = Blueprint('users', __name__)

@users.route('/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'name': user.username,
        'email': user.email,
        'phone': user.phone,
        'createdAt': user.created_at.isoformat()
    }), 200
