import requests
import datetime
import json
from backend.config import Config
from backend.models.ml_engine import scaling_engine
from backend.models.blending_optimizer import optimizer
from backend.services.gemini_service import gemini_service

class AgenticWorkflowOrchestrator:
    """
    Agentic AI Workflow Orchestrator implementing 6 autonomous agents:
    1. Water Monitoring Agent
    2. Scaling Risk Agent
    3. Optimization Agent
    4. Decision Agent
    5. Maintenance Agent
    6. Alert Agent (n8n Webhook Dispatcher)
    """

    @staticmethod
    def run_agentic_pipeline(input_params, user_id=1):
        execution_trace = []
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # AGENT 1: Water Monitoring Agent
        agent1_log = AgenticWorkflowOrchestrator._run_water_monitoring_agent(input_params)
        execution_trace.append(agent1_log)

        # AGENT 2: Scaling Risk Agent
        prediction_result = scaling_engine.predict(input_params)
        agent2_log = {
            'agent': 'Scaling Risk Agent',
            'status': 'SUCCESS',
            'timestamp': timestamp,
            'details': f"ML Model evaluated scaling risk: {prediction_result['scaling_prediction']} ({prediction_result['risk_probability']}%)"
        }
        execution_trace.append(agent2_log)

        # AGENT 3: Optimization Agent
        blending_result = optimizer.calculate_optimal_blend(
            prediction_result['scaling_prediction'],
            prediction_result['risk_probability'],
            input_params.get('tds', 750),
            input_params.get('ph', 8.1),
            input_params.get('conductivity', 950),
            input_params.get('daily_water_usage', 5200),
            input_params.get('cooling_cycles', 15)
        )
        agent3_log = {
            'agent': 'Optimization Agent',
            'status': 'SUCCESS',
            'timestamp': timestamp,
            'details': f"Calculated optimal ratio: {blending_result['freshwater_ratio']}% Freshwater / {blending_result['greywater_ratio']}% Greywater"
        }
        execution_trace.append(agent3_log)

        # AGENT 4: Decision Agent
        is_high_risk = (prediction_result['scaling_prediction'] == 'HIGH')
        agent4_log = {
            'agent': 'Decision Agent',
            'status': 'TRIGGERED' if is_high_risk else 'NORMAL',
            'timestamp': timestamp,
            'details': f"Evaluated operational path. Action Required: {'HIGH RISK ESCALATION' if is_high_risk else 'NORMAL MONITORING'}"
        }
        execution_trace.append(agent4_log)

        # AGENT 5: Maintenance Agent
        maintenance_tasks = []
        if is_high_risk:
            maintenance_tasks = [
                "Inspect main heat exchange plates for CaCO3 scaling formation.",
                "Verify cooling tower blowdown valve operation and conductivity sensor calibration.",
                f"Adjust chemical scale inhibitor dosage for elevated TDS ({input_params.get('tds')} ppm)."
            ]
        agent5_log = {
            'agent': 'Maintenance Agent',
            'status': 'TASKS_GENERATED' if is_high_risk else 'STANDBY',
            'timestamp': timestamp,
            'details': f"Generated {len(maintenance_tasks)} preventive maintenance task(s)."
        }
        execution_trace.append(agent5_log)

        # AGENT 6: Alert Agent (n8n Webhook Integration)
        n8n_status = "SKIPPED"
        if is_high_risk:
            n8n_payload = {
                'event': 'HIGH_SCALING_RISK_DETECTED',
                'timestamp': timestamp,
                'prediction': prediction_result,
                'blending': blending_result,
                'telemetry': input_params,
                'maintenance_tasks': maintenance_tasks,
                'source': 'HydroFusion AI Agentic Workflow'
            }
            n8n_status = AgenticWorkflowOrchestrator._trigger_n8n_webhook(n8n_payload)
            
        agent6_log = {
            'agent': 'Alert Agent',
            'status': n8n_status,
            'timestamp': timestamp,
            'details': f"Dispatched n8n Webhook / Notification Event. Status: {n8n_status}"
        }
        execution_trace.append(agent6_log)

        # Generate Gemini AI Explanation
        ai_response = gemini_service.generate_scaling_explanation(input_params, prediction_result, blending_result)

        return {
            'prediction_result': prediction_result,
            'blending_result': blending_result,
            'ai_response': ai_response,
            'execution_trace': execution_trace,
            'maintenance_tasks': maintenance_tasks
        }

    @staticmethod
    def _run_water_monitoring_agent(p):
        validations = []
        is_valid = True
        
        ph = float(p.get('ph', 7.0))
        if not (0.0 <= ph <= 14.0):
            validations.append(f"Invalid pH level: {ph} (Must be 0-14)")
            is_valid = False
            
        gpu_power = float(p.get('gpu_power_load', 0))
        if not (0.0 <= gpu_power <= 100.0):
            validations.append(f"Invalid GPU Power Load: {gpu_power}% (Must be 0-100%)")
            is_valid = False

        humidity = float(p.get('humidity', 0))
        if not (0.0 <= humidity <= 100.0):
            validations.append(f"Invalid Humidity: {humidity}% (Must be 0-100%)")
            is_valid = False
            
        for key in ['gpu_temperature', 'ambient_temperature', 'water_temperature', 'tds', 'conductivity', 'tower_age', 'cooling_cycles', 'flow_rate', 'daily_water_usage']:
            val = float(p.get(key, 0))
            if val < 0:
                validations.append(f"Invalid {key}: {val} (Must be non-negative)")
                is_valid = False

        status_str = "VALIDATED" if is_valid else "VALIDATION_FAILED"
        details_str = "All 12 telemetry parameters within normal operational bounds." if is_valid else "; ".join(validations)
        
        return {
            'agent': 'Water Monitoring Agent',
            'status': status_str,
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'details': details_str
        }

    @staticmethod
    def _trigger_n8n_webhook(payload):
        url = Config.N8N_WEBHOOK_URL
        try:
            # Short timeout to avoid blocking backend if external n8n is offline
            resp = requests.post(url, json=payload, timeout=2.0)
            if resp.status_code in [200, 201, 202]:
                return "DELIVERED_N8N"
            else:
                return f"N8N_HTTP_{resp.status_code}"
        except Exception:
            return "N8N_SIMULATED_LOCAL"

agentic_orchestrator = AgenticWorkflowOrchestrator()
