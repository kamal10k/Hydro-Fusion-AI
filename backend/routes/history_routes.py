from flask import Blueprint, jsonify, request
from backend.database import get_db_connection

history_bp = Blueprint('history', __name__, url_prefix='/api')

@history_bp.route('/history', methods=['GET'])
def get_prediction_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    risk_filter = request.args.get('risk', '').upper()
    limit = request.args.get('limit', 50, type=int)
    
    if risk_filter in ['HIGH', 'LOW']:
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
        
    rows = cursor.fetchall()
    history = [dict(row) for row in rows]
    conn.close()
    
    return jsonify({
        'count': len(history),
        'history': history
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
