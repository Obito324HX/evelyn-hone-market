from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
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
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if not validate_username(username):
        return jsonify({'error': 'Username must be 3-30 characters, letters, numbers and underscores only'}), 400
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Please enter a valid email address'}), 400
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    if not validate_password(password):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Account created!', 'user_id': user.id}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'user_id': user.id,
        'username': user.username,
        'verified': user.verified,
        'seller_approved': user.seller_approved,
        'student_id': user.student_id
    }), 200

@auth.route('/submit-student-id', methods=['POST'])
def submit_student_id():
    data = request.get_json()
    student_id = data.get('student_id', '').strip()
    if not student_id:
        return jsonify({'error': 'Student ID is required'}), 400
    if len(student_id) < 4:
        return jsonify({'error': 'Please enter a valid student ID'}), 400
    user = User.query.get(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.student_id = student_id
    db.session.commit()
    return jsonify({'message': 'Student ID submitted!'}), 200
