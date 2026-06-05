from flask import Blueprint, request, jsonify
from models import db, User, Listing, Message, Report

admin = Blueprint('admin', __name__)

ADMIN_KEY = 'evelyn-hone-admin-2026'

def check_admin(req):
    return req.headers.get('X-Admin-Key') == ADMIN_KEY

@admin.route('/stats', methods=['GET'])
def get_stats():
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
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
def get_users():
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'verified': u.verified,
        'student_id': u.student_id,
        'seller_approved': u.seller_approved,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200

@admin.route('/users/<int:id>/verify', methods=['PUT'])
def verify_user(id):
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get_or_404(id)
    user.verified = not user.verified
    db.session.commit()
    return jsonify({'message': 'Updated!', 'verified': user.verified}), 200

@admin.route('/users/<int:id>/approve-seller', methods=['PUT'])
def approve_seller(id):
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get_or_404(id)
    user.seller_approved = not user.seller_approved
    db.session.commit()
    return jsonify({'message': 'Updated!', 'seller_approved': user.seller_approved}), 200

@admin.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted!'}), 200

@admin.route('/listings', methods=['GET'])
def get_listings():
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
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
def delete_listing(id):
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    listing = Listing.query.get_or_404(id)
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted!'}), 200

@admin.route('/reports', methods=['GET'])
def get_reports():
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    all_reports = Report.query.all()
    return jsonify([{
        'id': r.id,
        'reason': r.reason,
        'reporter_id': r.reporter_id,
        'listing_id': r.listing_id,
        'created_at': r.created_at.isoformat()
    } for r in all_reports]), 200

@admin.route('/reports/<int:id>', methods=['DELETE'])
def delete_report(id):
    if not check_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401
    report = Report.query.get_or_404(id)
    db.session.delete(report)
    db.session.commit()
    return jsonify({'message': 'Report dismissed!'}), 200
