from flask import Blueprint, request, jsonify
from models import db, Notification, Message

notifications = Blueprint('notifications', __name__)

@notifications.route('/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    all_notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'content': n.content,
        'read': n.read,
        'created_at': n.created_at.isoformat()
    } for n in all_notifs]), 200

@notifications.route('/<int:id>/read', methods=['PUT'])
def mark_read(id):
    notif = Notification.query.get_or_404(id)
    notif.read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200

@notifications.route('/<int:user_id>/read-all', methods=['PUT'])
def mark_all_read(user_id):
    Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'}), 200
