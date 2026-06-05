from flask import Blueprint, request, jsonify
from models import db, Rating, User

ratings = Blueprint('ratings', __name__)

@ratings.route('/', methods=['POST'])
def add_rating():
    data = request.get_json()
    existing = Rating.query.filter_by(
        rater_id=data.get('rater_id'),
        seller_id=data.get('seller_id')
    ).first()
    if existing:
        existing.stars = data.get('stars')
        existing.comment = data.get('comment', '')
    else:
        rating = Rating(
            stars=data.get('stars'),
            comment=data.get('comment', ''),
            rater_id=data.get('rater_id'),
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
