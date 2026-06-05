from flask import Blueprint, request, jsonify
from models import db, Listing, User

listings = Blueprint('listings', __name__)

@listings.route('/', methods=['GET'])
def get_listings():
    category = request.args.get('category')
    if category:
        all_listings = Listing.query.filter_by(category=category).all()
    else:
        all_listings = Listing.query.all()

    result = []
    for listing in all_listings:
        seller = User.query.get(listing.user_id)
        result.append({
            'id': listing.id,
            'title': listing.title,
            'description': listing.description,
            'price': listing.price,
            'category': listing.category,
            'listing_type': listing.listing_type,
            'image': listing.image,
            'status': listing.status,
            'seller_id': listing.user_id,
            'seller_username': seller.username if seller else 'Unknown',
            'seller_verified': seller.verified if seller else False,
            'created_at': listing.created_at.isoformat()
        })
    return jsonify(result), 200

@listings.route('/', methods=['POST'])
def create_listing():
    data = request.get_json()
    listing = Listing(
        title=data.get('title'),
        description=data.get('description'),
        price=data.get('price'),
        category=data.get('category'),
        listing_type=data.get('listing_type', 'product'),
        image=data.get('image'),
        status='available',
        user_id=data.get('user_id')
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({'message': 'Listing created!', 'id': listing.id}), 201

@listings.route('/<int:id>/status', methods=['PUT'])
def update_status(id):
    listing = Listing.query.get_or_404(id)
    data = request.get_json()
    listing.status = data.get('status', 'available')
    db.session.commit()
    return jsonify({'message': 'Status updated!'}), 200

@listings.route('/<int:id>', methods=['DELETE'])
def delete_listing(id):
    listing = Listing.query.get_or_404(id)
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted!'}), 200
