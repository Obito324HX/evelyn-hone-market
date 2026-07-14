from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Message, Notification, User

messages = Blueprint('messages', __name__)

@messages.route('/', methods=['POST'])
@jwt_required()
def send_message():
    # sender_id now comes from the JWT, not the request body — previously
    # anyone could send a message "as" any user by passing their user_id.
    sender_id = get_jwt_identity()
    data = request.get_json()
    message = Message(
        content=data.get('content'),
        sender_id=sender_id,
        receiver_id=data.get('receiver_id'),
        listing_id=data.get('listing_id')
    )
    db.session.add(message)

    sender = User.query.get(sender_id)
    notification = Notification(
        content=f"New message from {sender.username if sender else 'someone'}",
        user_id=data.get('receiver_id')
    )
    db.session.add(notification)
    db.session.commit()
    return jsonify({'message': 'Message sent!'}), 201

@messages.route('/<int:user_id>', methods=['GET'])
def get_messages(user_id):
    msgs = Message.query.filter(
        (Message.sender_id == user_id) |
        (Message.receiver_id == user_id)
    ).all()

    result = []
    for msg in msgs:
        result.append({
            'id': msg.id,
            'content': msg.content,
            'sender_id': msg.sender_id,
            'receiver_id': msg.receiver_id,
            'listing_id': msg.listing_id,
            'created_at': msg.created_at.isoformat()
        })
    return jsonify(result), 200
