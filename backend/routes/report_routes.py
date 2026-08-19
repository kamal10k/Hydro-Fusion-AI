from flask import Blueprint, jsonify, request
import datetime
from backend.database import get_db_connection
from backend.services.forecast_service import forecast_service
from backend.models.ml_engine import scaling_engine

report_bp = Blueprint('report', __name__, url_prefix='/api/report')

@report_bp.route('/export', methods=['GET'])
def export_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    prediction_id = request.args.get('prediction_id', type=int)
    
    if prediction_id:
        cursor.execute("SELECT * FROM predictions WHERE prediction_id = ?", (prediction_id,))
    else:
        cursor.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1")
        
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'No prediction data found for report.'}), 404
        
    pred = dict(row)
    
    # Get user details
    cursor.execute("SELECT name, email, role FROM users WHERE user_id = ?", (pred['user_id'],))
    user_row = cursor.fetchone()
    user_info = dict(user_row) if user_row else {'name': 'Facility Engineering Team', 'role': 'Operator'}
    
    conn.close()

    # Generate Explainable AI breakdown
    xai_breakdown = scaling_engine._compute_explainability(pred, pred['risk_probability'])

    # Generate 24h Forecast summary for report
    forecast_data = forecast_service.generate_24h_forecast(pred)

    fresh_liters = round((pred['freshwater_ratio'] / 100.0) * pred['daily_water_usage'], 1)
    grey_liters = round((pred['greywater_ratio'] / 100.0) * pred['daily_water_usage'], 1)
    cost_savings_inr = round(grey_liters * 0.08, 2)
    
    report_payload = {
        'report_title': 'HYDROFUSION AI - DIGITAL CHEMIST EXECUTIVE WATER REPORT',
        'generated_at': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'user': user_info,
        'prediction_id': pred['prediction_id'],
        'created_at': pred['created_at'],
        'input_parameters': {
            'gpu_temperature': pred['gpu_temperature'],
            'gpu_power_load': pred['gpu_power_load'],
            'ambient_temperature': pred['ambient_temperature'],
            'humidity': pred['humidity'],
            'water_temperature': pred['water_temperature'],
            'tds': pred['tds'],
            'ph': pred['ph'],
            'conductivity': pred['conductivity'],
            'tower_age': pred['tower_age'],
            'cooling_cycles': pred['cooling_cycles'],
            'flow_rate': pred['flow_rate'],
            'daily_water_usage': pred['daily_water_usage']
        },
        'ai_prediction': {
            'scaling_prediction': pred['scaling_prediction'],
            'risk_probability': pred['risk_probability'],
            'confidence_score': pred.get('confidence_score', 95.0),
            'system_status': 'Attention Required' if pred['scaling_prediction'] in ['HIGH', 'CRITICAL'] else 'Normal Operation'
        },
        'water_blending': {
            'freshwater_ratio': pred['freshwater_ratio'],
            'greywater_ratio': pred['greywater_ratio'],
            'freshwater_daily_liters': fresh_liters,
            'greywater_daily_liters': grey_liters,
            'cost_savings_inr': cost_savings_inr,
            'cost_savings_usd': round(cost_savings_inr / 83.0, 2),
            'cooling_efficiency_pct': round(min(max(98.5 - (pred['risk_probability'] * 0.12), 75.0), 99.0), 1)
        },
        'explainable_ai': {
            'primary_contributors': xai_breakdown[:5],
            'summary': f"Primary scaling driver is {xai_breakdown[0]['name']} contributing {xai_breakdown[0]['contribution_pct']}% of total risk index."
        },
        'forecasting_summary': {
            'overall_trend': forecast_data['overall_trend'],
            'peak_risk_horizon': forecast_data['peak_risk_horizon'],
            'peak_risk_probability': forecast_data['peak_risk_probability'],
            'peak_risk_level': forecast_data['peak_risk_level'],
            'executive_insight': forecast_data['executive_insight']
        },
        'disclaimer': 'The ratio is an AI optimization recommendation. Safety constraints enforce minimum freshwater dilution during elevated mineral saturation.'
    }
    
    return jsonify(report_payload), 200
