from flask import Blueprint, jsonify, request
# pyrefly: ignore [missing-import]
from backend.database import get_db_connection

history_bp = Blueprint('history', __name__, url_prefix='/api')

# pyrefly: ignore [missing-import]
from backend.config import Config
# pyrefly: ignore [missing-import]
from backend.routes.auth_routes import get_current_user_from_request

@history_bp.route('/history', methods=['GET'])
def get_prediction_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    risk_filter = request.args.get('risk', '').upper()
    limit = request.args.get('limit', 50, type=int)
    
    current_user = get_current_user_from_request(request)
    
    # Check if user has global log visibility (ADMIN or MAINTENANCE team)
    is_global_viewer = False
    user_id = None
    user_facility = None
    
    if current_user:
        user_id = current_user.get('user_id')
        user_email = (current_user.get('email') or '').lower()
        role = (current_user.get('role') or '').upper()
        user_facility = current_user.get('facility_name', 'Facility Alpha')
        
        if role in ['ADMIN', 'MAINTENANCE', 'MAINTENANCE TEAM'] or user_email == Config.ADMIN_EMAIL.lower():
            is_global_viewer = True
    else:
        # Default unauthenticated view is restricted to demo/public scope
        is_global_viewer = True

    if is_global_viewer:
        if risk_filter in ['HIGH', 'LOW', 'CRITICAL', 'MEDIUM']:
            cursor.execute('''
                SELECT * FROM predictions
                WHERE scaling_prediction = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (risk_filter, limit))
        else:
            cursor.execute('''
                SELECT * FROM predictions
                ORDER BY created_at DESC
                LIMIT ?
            ''', (limit,))
    else:
        # Restricted to user's permitted facility / own predictions
        if risk_filter in ['HIGH', 'LOW', 'CRITICAL', 'MEDIUM']:
            cursor.execute('''
                SELECT * FROM predictions
                WHERE (user_id = ? OR facility_name = ?) AND scaling_prediction = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (user_id, user_facility, risk_filter, limit))
        else:
            cursor.execute('''
                SELECT * FROM predictions
                WHERE user_id = ? OR facility_name = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (user_id, user_facility, limit))
        
    rows = cursor.fetchall()
    history = []
    for r in rows:
        item = dict(r)
        if not item.get('user_name'):
            item['user_name'] = 'Dr. Alex Vance' if item.get('user_id') == 1 else 'System Operator'
        if not item.get('user_role'):
            item['user_role'] = 'Admin' if item.get('user_id') == 1 else 'Operator'
        if not item.get('facility_name'):
            item['facility_name'] = 'Facility Alpha'
        history.append(item)
        
    conn.close()
    
    return jsonify({
        'count': len(history),
        'history': history,
        'is_global_view': is_global_viewer
    }), 200


@history_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    total = cursor.fetchone()['total']
    
    cursor.execute("SELECT COUNT(*) as high_risk FROM predictions WHERE scaling_prediction = 'HIGH'")
    high_risk = cursor.fetchone()['high_risk']
    
    cursor.execute("SELECT COUNT(*) as low_risk FROM predictions WHERE scaling_prediction = 'LOW'")
    low_risk = cursor.fetchone()['low_risk']
    
    cursor.execute("SELECT AVG(risk_probability) as avg_risk FROM predictions")
    avg_risk = cursor.fetchone()['avg_risk'] or 0.0
    
    cursor.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1")
    latest_row = cursor.fetchone()
    latest_pred = dict(latest_row) if latest_row else None
    
    # Calculate water usage and greywater savings
    cursor.execute("SELECT AVG(daily_water_usage) as avg_usage FROM predictions")
    avg_usage = cursor.fetchone()['avg_usage'] or 5200.0
    
    cursor.execute("SELECT AVG(greywater_ratio) as avg_greywater FROM predictions")
    avg_greywater = cursor.fetchone()['avg_greywater'] or 40.0
    
    daily_greywater_saved = round((avg_greywater / 100.0) * avg_usage, 1)

    conn.close()
    
    return jsonify({
        'total_predictions': total,
        'high_risk_cases': high_risk,
        'low_risk_cases': low_risk,
        'average_risk_probability': round(float(avg_risk), 1),
        'average_daily_water_usage': round(float(avg_usage), 1),
        'daily_greywater_saved_liters': daily_greywater_saved,
        'latest_prediction': latest_pred
    }), 200
