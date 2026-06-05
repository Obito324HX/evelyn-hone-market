from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Account created!', 'user_id': user.id}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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
    user = User.query.get(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.student_id = data.get('student_id')
    db.session.commit()
    return jsonify({'message': 'Student ID submitted! Awaiting admin approval.'}), 200
