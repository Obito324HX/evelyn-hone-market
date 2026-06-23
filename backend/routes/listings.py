from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Listing, User

listings = Blueprint('listings', __name__)

VALID_CATEGORIES = ['Electronics', 'Textbooks', 'Clothing', 'Food', 'Services', 'Other']

def serialize_listing(listing, include_seller=False):
    seller = User.query.get(listing.user_id)
    data = {
        'id': listing.id,
        'title': listing.title,
        'description': listing.description,
        'price': listing.price,
        'category': listing.category,
        'listingType': listing.listing_type,
        'images': [listing.image] if listing.image else [],
        'status': listing.status,
        'sellerId': listing.user_id,
        'createdAt': listing.created_at.isoformat()
    }
    if include_seller:
        data['seller'] = {
            'id': seller.id,
            'name': seller.username,
            'phone': seller.phone,
            'verified': seller.verified
        } if seller else None
    else:
        data['sellerUsername'] = seller.username if seller else 'Unknown'
        data['sellerVerified'] = seller.verified if seller else False
    return data

@listings.route('/', methods=['GET'], strict_slashes=False)
def get_listings():
    search = request.args.get('search')
    category = request.args.get('category')
    seller_id = request.args.get('sellerId')

    query = Listing.query
    if category:
        query = query.filter_by(category=category)
    if seller_id:
        query = query.filter_by(user_id=seller_id)
    if search:
        query = query.filter(Listing.title.ilike(f'%{search}%'))

    all_listings = query.all()
    result = [serialize_listing(listing) for listing in all_listings]
    return jsonify(result), 200

@listings.route('/<int:id>', methods=['GET'])
def get_listing(id):
    listing = Listing.query.get(id)
    if not listing:
        return jsonify({'message': 'Listing not found'}), 404
    return jsonify(serialize_listing(listing, include_seller=True)), 200

@listings.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_listing():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    price = data.get('price')
    category = data.get('category', '').strip()
    images = data.get('images', [])

    if not title:
        return jsonify({'message': 'Title is required'}), 400
    if len(title) < 3:
        return jsonify({'message': 'Title must be at least 3 characters'}), 400
    if len(title) > 100:
        return jsonify({'message': 'Title must be under 100 characters'}), 400
    if not description:
        return jsonify({'message': 'Description is required'}), 400
    if len(description) < 10:
        return jsonify({'message': 'Description must be at least 10 characters'}), 400
    if price is None:
        return jsonify({'message': 'Price is required'}), 400
    try:
        price = float(price)
        if price < 0:
            return jsonify({'message': 'Price cannot be negative'}), 400
        if price > 1000000:
            return jsonify({'message': 'Price seems too high'}), 400
    except (ValueError, TypeError):
        return jsonify({'message': 'Price must be a valid number'}), 400
    if not category:
        return jsonify({'message': 'Category is required'}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({'message': 'Invalid category'}), 400

    seller = User.query.get(user_id)
    if not seller:
        return jsonify({'message': 'User not found'}), 404
    if not seller.seller_approved:
        return jsonify({'message': 'You must be approved as a seller first'}), 403

    listing = Listing(
        title=title,
        description=description,
        price=price,
        category=category,
        listing_type=data.get('listingType', 'product'),
        image=images[0] if images else None,
        status='available',
        user_id=user_id
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify(serialize_listing(listing, include_seller=True)), 201

@listings.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_listing(id):
    listing = Listing.query.get_or_404(id)
    if str(listing.user_id) != get_jwt_identity():
        return jsonify({'message': 'Not authorized'}), 403

    data = request.get_json()
    title = data.get('title', listing.title).strip()
    description = data.get('description', listing.description).strip()
    price = data.get('price', listing.price)
    category = data.get('category', listing.category).strip()
    images = data.get('images')

    if not title or len(title) < 3 or len(title) > 100:
        return jsonify({'message': 'Title must be 3-100 characters'}), 400
    if not description or len(description) < 10:
        return jsonify({'message': 'Description must be at least 10 characters'}), 400
    try:
        price = float(price)
        if price < 0 or price > 1000000:
            return jsonify({'message': 'Price must be between 0 and 1,000,000'}), 400
    except (ValueError, TypeError):
        return jsonify({'message': 'Price must be a valid number'}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({'message': 'Invalid category'}), 400

    listing.title = title
    listing.description = description
    listing.price = price
    listing.category = category
    if images is not None:
        listing.image = images[0] if images else None

    db.session.commit()
    return jsonify(serialize_listing(listing, include_seller=True)), 200

@listings.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_status(id):
    listing = Listing.query.get_or_404(id)
    if str(listing.user_id) != get_jwt_identity():
        return jsonify({'message': 'Not authorized'}), 403
    data = request.get_json()
    status = data.get('status', 'available')
    valid_statuses = ['available', 'reserved', 'sold']
    if status not in valid_statuses:
        return jsonify({'message': 'Invalid status'}), 400
    listing.status = status
    db.session.commit()
    return jsonify({'message': 'Status updated!'}), 200

@listings.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_listing(id):
    listing = Listing.query.get_or_404(id)
    if str(listing.user_id) != get_jwt_identity():
        return jsonify({'message': 'Not authorized'}), 403
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted!'}), 200
