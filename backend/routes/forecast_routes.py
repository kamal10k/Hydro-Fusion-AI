from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import]
from backend.database import get_db_connection
# pyrefly: ignore [missing-import]
from backend.services.forecast_service import forecast_service

forecast_bp = Blueprint('forecast', __name__, url_prefix='/api/forecast')

@forecast_bp.route('/24h', methods=['GET'])
def get_24h_forecast():
    """Returns 24-hour scaling risk forecast based on latest system prediction telemetry."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1")
    latest_row = cursor.fetchone()
    conn.close()

    if latest_row:
        telemetry = dict(latest_row)
    else:
        telemetry = {
            'gpu_temperature': 85.0,
            'gpu_power_load': 92.0,
            'ambient_temperature': 37.0,
            'humidity': 70.0,
            'water_temperature': 31.0,
            'tds': 750.0,
            'ph': 8.1,
            'conductivity': 950.0,
            'tower_age': 5.0,
            'cooling_cycles': 15.0,
            'flow_rate': 100.0,
            'daily_water_usage': 5200.0,
            'risk_probability': 87.5
        }

    forecast_data = forecast_service.generate_24h_forecast(telemetry)
    return jsonify(forecast_data), 200

@forecast_bp.route('/simulate', methods=['POST'])
def simulate_forecast():
    """Calculates a simulated 24-hour forecast from custom telemetry parameters."""
    data = request.get_json() or {}
    forecast_data = forecast_service.generate_24h_forecast(data)
    return jsonify(forecast_data), 200
