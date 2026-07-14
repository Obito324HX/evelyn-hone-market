from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Rating, User

ratings = Blueprint('ratings', __name__)

@ratings.route('/', methods=['POST'])
@jwt_required()
def add_rating():
    # rater_id now comes from the JWT, not the request body — previously
    # anyone could submit a rating "as" any user by passing their user_id.
    rater_id = get_jwt_identity()
    data = request.get_json()
    existing = Rating.query.filter_by(
        rater_id=rater_id,
        seller_id=data.get('seller_id')
    ).first()
    if existing:
        existing.stars = data.get('stars')
        existing.comment = data.get('comment', '')
    else:
        rating = Rating(
            stars=data.get('stars'),
            comment=data.get('comment', ''),
            rater_id=rater_id,
            seller_id=data.get('seller_id')
        )
        db.session.add(rating)
    db.session.commit()
    return jsonify({'message': 'Rating submitted!'}), 201

@ratings.route('/<int:seller_id>', methods=['GET'])
def get_ratings(seller_id):
    all_ratings = Rating.query.filter_by(seller_id=seller_id).all()
    total = len(all_ratings)
    avg = round(sum(r.stars for r in all_ratings) / total, 1) if total > 0 else 0
    return jsonify({
        'average': avg,
        'total': total,
        'ratings': [{'stars': r.stars, 'comment': r.comment, 'rater_id': r.rater_id} for r in all_ratings]
    }), 200
