from flask import Blueprint, request, jsonify
from backend.database import get_db_connection
from backend.services.agentic_workflow import agentic_orchestrator
from backend.models.ml_engine import scaling_engine
from backend.models.blending_optimizer import optimizer

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

REQUIRED_FIELDS = [
    'gpu_temperature', 'gpu_power_load', 'ambient_temperature', 'humidity',
    'water_temperature', 'tds', 'ph', 'conductivity', 'tower_age',
    'cooling_cycles', 'flow_rate', 'daily_water_usage'
]

VALIDATION_RULES = {
    'gpu_temperature': (0.0, 120.0, "°C"),
    'gpu_power_load': (0.0, 100.0, "%"),
    'ambient_temperature': (-20.0, 60.0, "°C"),
    'humidity': (0.0, 100.0, "%"),
    'water_temperature': (0.0, 80.0, "°C"),
    'tds': (0.0, 5000.0, "ppm"),
    'ph': (0.0, 14.0, "pH"),
    'conductivity': (0.0, 5000.0, "µS/cm"),
    'tower_age': (0.0, 50.0, "years"),
    'cooling_cycles': (1.0, 50.0, "cycles"),
    'flow_rate': (1.0, 1000.0, "L/min"),
    'daily_water_usage': (10.0, 100000.0, "L/day")
}

def validate_input_payload(data):
    if not isinstance(data, dict):
        return False, "Invalid payload format. Expected JSON object."

    errors = []
    parsed_params = {}

    for field in REQUIRED_FIELDS:
        if field not in data or data[field] is None or data[field] == "":
            errors.append(f"Missing required field: '{field}'")
            continue

        try:
            val = float(data[field])
            min_val, max_val, unit = VALIDATION_RULES[field]
            if val < min_val or val > max_val:
                errors.append(f"Field '{field}' ({val} {unit}) is out of valid range [{min_val} to {max_val}].")
            else:
                parsed_params[field] = val
        except (ValueError, TypeError):
            errors.append(f"Field '{field}' must be a valid numeric value.")

    if errors:
        return False, errors
    return True, parsed_params

from backend.routes.auth_routes import get_current_user_from_request

@predict_bp.route('/predict', methods=['POST'])
def predict_scaling_risk():
    data = request.get_json() or {}
    is_valid, result = validate_input_payload(data)

    if not is_valid:
        return jsonify({'error': 'Validation Failed', 'details': result}), 400

    parsed_params = result
    
    # Determine authenticated user context
    current_user = get_current_user_from_request(request)
    conn = get_db_connection()
    cursor = conn.cursor()

    if current_user:
        user_id = current_user.get('user_id', 1)
        user_name = current_user.get('name', 'Operator')
        user_email = current_user.get('email', '')
        user_role = current_user.get('role', 'Operator')
        facility_name = current_user.get('facility_name', 'Facility Alpha')
    else:
        req_user_id = data.get('user_id', 1)
        cursor.execute("SELECT user_id, name, email, role, facility_name FROM users WHERE user_id = ?", (req_user_id,))
        db_u = cursor.fetchone()
        if db_u:
            user_id = db_u['user_id']
            user_name = db_u['name']
            user_email = db_u['email']
            user_role = db_u['role']
            facility_name = db_u['facility_name'] or 'Facility Alpha'
        else:
            user_id = 1
            user_name = 'Dr. Alex Vance'
            user_email = 'alex.vance@hydrofusion.ai'
            user_role = 'Admin'
            facility_name = 'Facility Alpha'

    # Execute 6-Agent Agentic AI Workflow
    workflow_result = agentic_orchestrator.run_agentic_pipeline(parsed_params, user_id=user_id)
    pred_res = workflow_result['prediction_result']
    blend_res = workflow_result['blending_result']
    ai_resp = workflow_result['ai_response']

    # Save prediction to DB with complete user and facility context
    cursor.execute('''
        INSERT INTO predictions (
            user_id, user_name, user_email, user_role, facility_name,
            gpu_temperature, gpu_power_load, ambient_temperature, humidity, water_temperature,
            tds, ph, conductivity, tower_age, cooling_cycles, flow_rate, daily_water_usage,
            scaling_prediction, risk_probability, freshwater_ratio, greywater_ratio, cost_savings_inr, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ''', (
        user_id,
        user_name,
        user_email,
        user_role,
        facility_name,
        parsed_params['gpu_temperature'],
        parsed_params['gpu_power_load'],
        parsed_params['ambient_temperature'],
        parsed_params['humidity'],
        parsed_params['water_temperature'],
        parsed_params['tds'],
        parsed_params['ph'],
        parsed_params['conductivity'],
        parsed_params['tower_age'],
        parsed_params['cooling_cycles'],
        parsed_params['flow_rate'],
        parsed_params['daily_water_usage'],
        pred_res['scaling_prediction'],
        pred_res['risk_probability'],
        blend_res['freshwater_ratio'],
        blend_res['greywater_ratio'],
        blend_res['cost_savings_inr'],
        pred_res.get('confidence_score', 95.0)
    ))
    prediction_id = cursor.lastrowid


    # Create Alert record if scaling risk is HIGH or CRITICAL
    if pred_res['scaling_prediction'] in ['HIGH', 'CRITICAL']:
        severity = 'CRITICAL' if pred_res['scaling_prediction'] == 'CRITICAL' else 'HIGH'
        alert_msg = f"{severity} SCALING RISK ({pred_res['risk_probability']}%). Blending adjustment to {blend_res['freshwater_ratio']}% Freshwater / {blend_res['greywater_ratio']}% Greywater enforced."
        cursor.execute('''
            INSERT INTO alerts (prediction_id, alert_type, severity, message, status)
            VALUES (?, 'HIGH_SCALING_RISK', ?, ?, 'Active')
        ''', (prediction_id, severity, alert_msg))

    conn.commit()
    conn.close()

    return jsonify({
        'prediction_id': prediction_id,
        'input_parameters': parsed_params,
        'scaling_prediction': pred_res['scaling_prediction'],
        'risk_probability': pred_res['risk_probability'],
        'confidence_score': pred_res.get('confidence_score', 95.0),
        'feature_contributions': pred_res.get('feature_contributions', []),
        'freshwater_ratio': blend_res['freshwater_ratio'],
        'greywater_ratio': blend_res['greywater_ratio'],
        'freshwater_daily_liters': blend_res['freshwater_daily_liters'],
        'greywater_daily_liters': blend_res['greywater_daily_liters'],
        'cost_savings_inr': blend_res['cost_savings_inr'],
        'cost_savings_usd': blend_res['cost_savings_usd'],
        'cooling_efficiency_pct': blend_res['cooling_efficiency_pct'],
        'safety_override_active': blend_res.get('safety_override_active', False),
        'rationale': blend_res['rationale'],
        'disclaimer': blend_res['disclaimer'],
        'ai_explanation': ai_resp.get('explanation', ''),
        'ai_recommendations': ai_resp.get('recommendations', []),
        'maintenance_tasks': workflow_result['maintenance_tasks'],
        'agent_execution_trace': workflow_result['execution_trace'],
        'system_status': 'Attention Required' if pred_res['scaling_prediction'] in ['HIGH', 'CRITICAL'] else 'Normal Operation'
    }), 200

@predict_bp.route('/simulate', methods=['POST'])
def run_what_if_simulation():
    """What-If Simulation Laboratory endpoint (does not save to main history)."""
    data = request.get_json() or {}
    is_valid, result = validate_input_payload(data)

    if not is_valid:
        return jsonify({'error': 'Validation Failed', 'details': result}), 400

    parsed_params = result

    # Run ML and Blending engines directly
    pred_res = scaling_engine.predict(parsed_params)
    blend_res = optimizer.calculate_optimal_blend(
        pred_res['scaling_prediction'],
        pred_res['risk_probability'],
        parsed_params['tds'],
        parsed_params['ph'],
        parsed_params['conductivity'],
        parsed_params['daily_water_usage'],
        parsed_params['cooling_cycles']
    )

    return jsonify({
        'simulation': True,
        'input_parameters': parsed_params,
        'scaling_prediction': pred_res['scaling_prediction'],
        'risk_probability': pred_res['risk_probability'],
        'confidence_score': pred_res.get('confidence_score', 95.0),
        'feature_contributions': pred_res.get('feature_contributions', []),
        'freshwater_ratio': blend_res['freshwater_ratio'],
        'greywater_ratio': blend_res['greywater_ratio'],
        'freshwater_daily_liters': blend_res['freshwater_daily_liters'],
        'greywater_daily_liters': blend_res['greywater_daily_liters'],
        'cost_savings_inr': blend_res['cost_savings_inr'],
        'cost_savings_usd': blend_res['cost_savings_usd'],
        'cooling_efficiency_pct': blend_res['cooling_efficiency_pct'],
        'safety_override_active': blend_res.get('safety_override_active', False),
        'rationale': blend_res['rationale']
    }), 200
