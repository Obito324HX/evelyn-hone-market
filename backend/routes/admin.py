from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models import db, User, Listing, Message, Report

admin = Blueprint('admin', __name__)


def require_admin(fn):
    """
    Verifies a valid JWT AND that the token's user is actually flagged as
    admin in the database. This replaces a static shared key (which was
    embedded in shipped frontend code and visible to any visitor) with a
    real, per-user, server-verified check — the same authorization model
    already used for regular logged-in routes elsewhere in this app.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin.route('/stats', methods=['GET'])
@require_admin
def get_stats():
    return jsonify({
        'total_users': User.query.count(),
        'total_listings': Listing.query.count(),
        'total_messages': Message.query.count(),
        'total_reports': Report.query.count(),
        'pending_sellers': User.query.filter(User.student_id != None, User.seller_approved == False).count(),
        'available': Listing.query.filter_by(status='available').count(),
        'sold': Listing.query.filter_by(status='sold').count(),
        'reserved': Listing.query.filter_by(status='reserved').count(),
    }), 200


@admin.route('/users', methods=['GET'])
@require_admin
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'verified': u.verified,
        'student_id': u.student_id,
        'seller_approved': u.seller_approved,
        'is_admin': u.is_admin,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200


@admin.route('/users/<int:id>/verify', methods=['PUT'])
@require_admin
def verify_user(id):
    user = User.query.get_or_404(id)
    user.verified = not user.verified
    db.session.commit()
    return jsonify({'message': 'Updated!', 'verified': user.verified}), 200


@admin.route('/users/<int:id>/approve-seller', methods=['PUT'])
@require_admin
def approve_seller(id):
    user = User.query.get_or_404(id)
    user.seller_approved = not user.seller_approved
    db.session.commit()
    return jsonify({'message': 'Updated!', 'seller_approved': user.seller_approved}), 200


@admin.route('/users/<int:id>/toggle-admin', methods=['PUT'])
@require_admin
def toggle_admin(id):
    """
    Promotes or demotes a user's admin status. Replaces the old fake
    'add admin account' flow, which just appended a plaintext password
    to a browser localStorage array and never touched the real backend
    at all. Admin status now lives only in the database, on real
    accounts, verified server-side.
    """
    current_user_id = get_jwt_identity()
    if str(id) == str(current_user_id):
        return jsonify({'error': 'You cannot change your own admin status'}), 400
    user = User.query.get_or_404(id)
    user.is_admin = not user.is_admin
    db.session.commit()
    return jsonify({'message': 'Updated!', 'is_admin': user.is_admin}), 200


@admin.route('/change-password', methods=['PUT'])
@require_admin
def change_password():
    """
    Lets the logged-in admin change their own real account password.
    Requires the current password, hashed and verified server-side —
    replaces the old flow, which just overwrote a plaintext password
    in localStorage with no verification at all.
    """
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not check_password_hash(user.password, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'message': 'Password updated!'}), 200


@admin.route('/users/<int:id>', methods=['DELETE'])
@require_admin
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted!'}), 200


@admin.route('/listings', methods=['GET'])
@require_admin
def get_listings():
    all_listings = Listing.query.all()
    return jsonify([{
        'id': l.id,
        'title': l.title,
        'price': l.price,
        'category': l.category,
        'status': l.status,
        'seller_id': l.user_id,
        'created_at': l.created_at.isoformat()
    } for l in all_listings]), 200


@admin.route('/listings/<int:id>', methods=['DELETE'])
@require_admin
def delete_listing(id):
    listing = Listing.query.get_or_404(id)
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted!'}), 200


@admin.route('/reports', methods=['GET'])
@require_admin
def get_reports():
    all_reports = Report.query.all()
    return jsonify([{
        'id': r.id,
        'reason': r.reason,
        'reporter_id': r.reporter_id,
        'listing_id': r.listing_id,
        'created_at': r.created_at.isoformat()
    } for r in all_reports]), 200


@admin.route('/reports/<int:id>', methods=['DELETE'])
@require_admin
def delete_report(id):
    report = Report.query.get_or_404(id)
    db.session.delete(report)
    db.session.commit()
    return jsonify({'message': 'Report dismissed!'}), 200
