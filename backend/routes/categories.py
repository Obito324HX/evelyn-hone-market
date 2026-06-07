from flask import Blueprint, request, jsonify
from models import db, Category

categories = Blueprint('categories', __name__)

DEFAULT_CATEGORIES = [
    {'name': 'Electronics', 'icon': '💻'},
    {'name': 'Textbooks', 'icon': '📚'},
    {'name': 'Clothing', 'icon': '👕'},
    {'name': 'Food', 'icon': '🍱'},
    {'name': 'Services', 'icon': '🔧'},
    {'name': 'Other', 'icon': '📦'}
]

@categories.route('/', methods=['GET'])
def get_categories():
    cats = Category.query.order_by(Category.name).all()
    if not cats:
        for c in DEFAULT_CATEGORIES:
            cat = Category(name=c['name'], icon=c['icon'])
            db.session.add(cat)
        db.session.commit()
        cats = Category.query.order_by(Category.name).all()
    return jsonify([{'id': c.id, 'name': c.name, 'icon': c.icon} for c in cats]), 200

@categories.route('/', methods=['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name', '').strip()
    icon = data.get('icon', '📦').strip()
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
    if len(name) < 2 or len(name) > 50:
        return jsonify({'error': 'Name must be 2-50 characters'}), 400
    if Category.query.filter_by(name=name).first():
        return jsonify({'error': 'Category already exists'}), 400
    cat = Category(name=name, icon=icon)
    db.session.add(cat)
    db.session.commit()
    return jsonify({'message': 'Category added!', 'id': cat.id}), 201

@categories.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    cat = Category.query.get_or_404(id)
    db.session.delete(cat)
    db.session.commit()
    return jsonify({'message': 'Category deleted!'}), 200
