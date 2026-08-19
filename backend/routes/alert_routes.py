from flask import Blueprint, jsonify, request
from backend.database import get_db_connection

alert_bp = Blueprint('alert', __name__, url_prefix='/api/alerts')

@alert_bp.route('', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT a.*, p.gpu_temperature, p.tds, p.ph, p.scaling_prediction, p.risk_probability
        FROM alerts a
        LEFT JOIN predictions p ON a.prediction_id = p.prediction_id
        ORDER BY a.created_at DESC
        LIMIT 50
    ''')
    rows = cursor.fetchall()
    alerts = [dict(row) for row in rows]
    conn.close()
    
    return jsonify({
        'count': len(alerts),
        'alerts': alerts
    }), 200

@alert_bp.route('/<int:alert_id>/dismiss', methods=['PUT'])
def dismiss_alert(alert_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE alert_id = ?", (alert_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': f'Alert {alert_id} marked as Resolved.'}), 200

@alert_bp.route('/thresholds', methods=['GET'])
def get_thresholds():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_thresholds ORDER BY threshold_id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return jsonify(dict(row)), 200
    return jsonify({
        'tds_max_limit': 800.0,
        'ph_min_limit': 6.8,
        'ph_max_limit': 8.2,
        'conductivity_max_limit': 1000.0,
        'risk_probability_threshold': 60.0,
        'rapid_increase_rate_threshold': 20.0,
        'email_alerts_enabled': 1
    }), 200

@alert_bp.route('/thresholds', methods=['PUT'])
def update_thresholds():
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tds_max = float(data.get('tds_max_limit', 800.0))
    ph_min = float(data.get('ph_min_limit', 6.8))
    ph_max = float(data.get('ph_max_limit', 8.2))
    cond_max = float(data.get('conductivity_max_limit', 1000.0))
    risk_thresh = float(data.get('risk_probability_threshold', 60.0))
    rapid_thresh = float(data.get('rapid_increase_rate_threshold', 20.0))
    email_enabled = int(data.get('email_alerts_enabled', 1))

    cursor.execute('''
        UPDATE system_thresholds 
        SET tds_max_limit = ?, ph_min_limit = ?, ph_max_limit = ?, 
            conductivity_max_limit = ?, risk_probability_threshold = ?, 
            rapid_increase_rate_threshold = ?, email_alerts_enabled = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE threshold_id = 1
    ''', (tds_max, ph_min, ph_max, cond_max, risk_thresh, rapid_thresh, email_enabled))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'System alert thresholds updated successfully.',
        'updated_thresholds': {
            'tds_max_limit': tds_max,
            'ph_min_limit': ph_min,
            'ph_max_limit': ph_max,
            'conductivity_max_limit': cond_max,
            'risk_probability_threshold': risk_thresh,
            'rapid_increase_rate_threshold': rapid_thresh,
            'email_alerts_enabled': email_enabled
        }
    }), 200
