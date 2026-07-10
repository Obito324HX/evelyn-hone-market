from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User
import re

auth = Blueprint('auth', __name__)

def validate_email(email):
    return re.match(r'^[^@]+@[^@]+\.[^@]+$', email)

def validate_password(password):
    return len(password) >= 6

def validate_username(username):
    return len(username) >= 3 and len(username) <= 30 and re.match(r'^[a-zA-Z0-9_]+$', username)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = (data.get('name') or data.get('username') or '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = (data.get('phone') or '').strip()

    if not username:
        return jsonify({'message': 'Name is required'}), 400
    if not validate_username(username):
        return jsonify({'message': 'Name must be 3-30 characters, letters, numbers and underscores only'}), 400
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    if not validate_email(email):
        return jsonify({'message': 'Please enter a valid email address'}), 400
    if not password:
        return jsonify({'message': 'Password is required'}), 400
    if not validate_password(password):
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password, phone=phone or None)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'phone': user.phone,
            'verified': user.verified,
            'seller_approved': user.seller_approved,
            'student_id': user.student_id,
            'is_admin': user.is_admin
        }
    }), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'phone': user.phone,
            'verified': user.verified,
            'seller_approved': user.seller_approved,
            'student_id': user.student_id,
            'is_admin': user.is_admin
        }
    }), 200

@auth.route('/submit-student-id', methods=['POST'])
def submit_student_id():
    data = request.get_json()
    student_id = data.get('student_id', '').strip()
    if not student_id:
        return jsonify({'message': 'Student ID is required'}), 400
    if len(student_id) < 4:
        return jsonify({'message': 'Please enter a valid student ID'}), 400
    user = User.query.get(data.get('user_id'))
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user.student_id = student_id
    db.session.commit()
    return jsonify({'message': 'Student ID submitted!'}), 200
