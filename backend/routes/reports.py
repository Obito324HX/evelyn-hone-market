from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Report

reports = Blueprint('reports', __name__)

@reports.route('/', methods=['POST'])
@jwt_required()
def report_listing():
    # reporter_id now comes from the JWT, not the request body — previously
    # anyone could file a report "as" any user by passing their user_id.
    reporter_id = get_jwt_identity()
    data = request.get_json()
    existing = Report.query.filter_by(
        reporter_id=reporter_id,
        listing_id=data.get('listing_id')
    ).first()
    if existing:
        return jsonify({'error': 'You have already reported this listing'}), 400
    report = Report(
        reason=data.get('reason'),
        reporter_id=reporter_id,
        listing_id=data.get('listing_id')
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'message': 'Report submitted!'}), 201

@reports.route('/', methods=['GET'])
def get_reports():
    all_reports = Report.query.all()
    return jsonify([{
        'id': r.id,
        'reason': r.reason,
        'reporter_id': r.reporter_id,
        'listing_id': r.listing_id,
        'created_at': r.created_at.isoformat()
    } for r in all_reports]), 200
