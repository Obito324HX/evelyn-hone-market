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

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    price = data.get('price')
    category = data.get('category', '').strip()
    user_id = data.get('user_id')

    if not title:
        return jsonify({'error': 'Title is required'}), 400
    if len(title) < 3:
        return jsonify({'error': 'Title must be at least 3 characters'}), 400
    if len(title) > 100:
        return jsonify({'error': 'Title must be under 100 characters'}), 400
    if not description:
        return jsonify({'error': 'Description is required'}), 400
    if len(description) < 10:
        return jsonify({'error': 'Description must be at least 10 characters'}), 400
    if price is None:
        return jsonify({'error': 'Price is required'}), 400
    try:
        price = float(price)
        if price < 0:
            return jsonify({'error': 'Price cannot be negative'}), 400
        if price > 1000000:
            return jsonify({'error': 'Price seems too high'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Price must be a valid number'}), 400
    if not category:
        return jsonify({'error': 'Category is required'}), 400

    valid_categories = ['Electronics', 'Textbooks', 'Clothing', 'Food', 'Services', 'Other']
    if category not in valid_categories:
        return jsonify({'error': 'Invalid category'}), 400

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    seller = User.query.get(user_id)
    if not seller:
        return jsonify({'error': 'User not found'}), 404
    if not seller.seller_approved:
        return jsonify({'error': 'You must be approved as a seller first'}), 403

    listing = Listing(
        title=title,
        description=description,
        price=price,
        category=category,
        listing_type=data.get('listing_type', 'product'),
        image=data.get('image'),
        status='available',
        user_id=user_id
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({'message': 'Listing created!', 'id': listing.id}), 201

@listings.route('/<int:id>/status', methods=['PUT'])
def update_status(id):
    listing = Listing.query.get_or_404(id)
    data = request.get_json()
    status = data.get('status', 'available')
    valid_statuses = ['available', 'reserved', 'sold']
    if status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    listing.status = status
    db.session.commit()
    return jsonify({'message': 'Status updated!'}), 200

@listings.route('/<int:id>', methods=['DELETE'])
def delete_listing(id):
    listing = Listing.query.get_or_404(id)
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted!'}), 200
