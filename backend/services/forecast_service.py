import datetime
import math
# pyrefly: ignore [missing-import]
from backend.models.ml_engine import scaling_engine
# pyrefly: ignore [missing-import]
from backend.models.blending_optimizer import optimizer

class RiskForecastService:
    @staticmethod
    def generate_24h_forecast(base_telemetry):
        """
        Generates 24-hour predictive forecast across 4 key time horizons:
        +1h, +6h, +12h, +24h.
        """
        now = datetime.datetime.now()
        
        gpu_temp = float(base_telemetry.get('gpu_temperature', 85.0))
        gpu_power = float(base_telemetry.get('gpu_power_load', 92.0))
        amb_temp = float(base_telemetry.get('ambient_temperature', 37.0))
        humidity = float(base_telemetry.get('humidity', 70.0))
        water_temp = float(base_telemetry.get('water_temperature', 31.0))
        tds = float(base_telemetry.get('tds', 750.0))
        ph = float(base_telemetry.get('ph', 8.1))
        conductivity = float(base_telemetry.get('conductivity', 950.0))
        tower_age = float(base_telemetry.get('tower_age', 5.0))
        cycles = float(base_telemetry.get('cooling_cycles', 15.0))
        flow_rate = float(base_telemetry.get('flow_rate', 100.0))
        daily_usage = float(base_telemetry.get('daily_water_usage', 5200.0))

        # Time horizon delta modeling
        horizons = [
            {
                'horizon_id': '1h',
                'label': '+1 Hour (Immediate)',
                'hours_ahead': 1,
                'temp_delta': 0.5,
                'power_delta': -2.0,
                'tds_delta': 15.0,
                'cycles_delta': 0.3,
                'driving_factor': 'Near-term thermal workload persistence and initial cycle concentration.'
            },
            {
                'horizon_id': '6h',
                'label': '+6 Hours (Afternoon Peak)',
                'hours_ahead': 6,
                'temp_delta': 3.5,
                'power_delta': 5.0,
                'tds_delta': 65.0,
                'cycles_delta': 1.8,
                'driving_factor': 'Diurnal ambient solar heating peaking combined with elevated AI cluster workload.'
            },
            {
                'horizon_id': '12h',
                'label': '+12 Hours (Night Batch)',
                'hours_ahead': 12,
                'temp_delta': -4.0,
                'power_delta': -8.0,
                'tds_delta': 40.0,
                'cycles_delta': 2.5,
                'driving_factor': 'Ambient cooling recovery counterbalanced by accumulated tower evaporative mineral concentration.'
            },
            {
                'horizon_id': '24h',
                'label': '+24 Hours (Full Diurnal Cycle)',
                'hours_ahead': 24,
                'temp_delta': 1.0,
                'power_delta': 2.0,
                'tds_delta': 90.0,
                'cycles_delta': 3.5,
                'driving_factor': '24-hour cumulative mineral supersaturation without intermediate blowdown cycle.'
            }
        ]

        forecast_points = []
        probabilities = []

        for h in horizons:
            # pyrefly: ignore [bad-argument-type]
            target_time = now + datetime.timedelta(hours=h['hours_ahead'])
            
            # pyrefly: ignore [unsupported-operation]
            p_gpu_temp = round(min(max(gpu_temp + (h['temp_delta'] * 0.8), 50.0), 98.0), 1)
            # pyrefly: ignore [unsupported-operation]
            p_gpu_power = round(min(max(gpu_power + h['power_delta'], 30.0), 100.0), 1)
            # pyrefly: ignore [unsupported-operation]
            p_amb_temp = round(min(max(amb_temp + h['temp_delta'], 15.0), 50.0), 1)
            # pyrefly: ignore [unsupported-operation]
            p_water_temp = round(min(max(water_temp + (h['temp_delta'] * 0.5), 18.0), 45.0), 1)
            # pyrefly: ignore [unsupported-operation]
            p_tds = round(min(max(tds + h['tds_delta'], 200.0), 1600.0), 1)
            # pyrefly: ignore [unsupported-operation]
            p_ph = round(min(max(ph + (h['tds_delta'] / 600.0), 6.5), 9.2), 2)
            p_cond = round(p_tds * 1.32, 1)
            # pyrefly: ignore [unsupported-operation]
            p_cycles = round(min(max(cycles + h['cycles_delta'], 2.0), 30.0), 1)

            horizon_telemetry = {
                'gpu_temperature': p_gpu_temp,
                'gpu_power_load': p_gpu_power,
                'ambient_temperature': p_amb_temp,
                'humidity': humidity,
                'water_temperature': p_water_temp,
                'tds': p_tds,
                'ph': p_ph,
                'conductivity': p_cond,
                'tower_age': tower_age,
                'cooling_cycles': p_cycles,
                'flow_rate': flow_rate,
                'daily_water_usage': daily_usage
            }

            pred = scaling_engine.predict(horizon_telemetry)
            blend = optimizer.calculate_optimal_blend(
                pred['scaling_prediction'],
                pred['risk_probability'],
                p_tds,
                p_ph,
                p_cond,
                daily_usage,
                p_cycles
            )

            probabilities.append(pred['risk_probability'])

            forecast_points.append({
                'horizon_id': h['horizon_id'],
                'label': h['label'],
                'target_timestamp': target_time.strftime('%Y-%m-%d %H:%M'),
                'hours_ahead': h['hours_ahead'],
                'forecasted_risk': pred['scaling_prediction'],
                'risk_probability': pred['risk_probability'],
                'confidence_score': pred['confidence_score'],
                'projected_tds': p_tds,
                'projected_ph': p_ph,
                'projected_gpu_temp': p_gpu_temp,
                'projected_cycles': p_cycles,
                'recommended_freshwater_ratio': blend['freshwater_ratio'],
                'recommended_greywater_ratio': blend['greywater_ratio'],
                'cost_savings_inr': blend['cost_savings_inr'],
                'driving_factor': h['driving_factor']
            })

        # Trajectory & Trend Analysis
        first_prob = probabilities[0]
        last_prob = probabilities[-1]
        max_prob = max(probabilities)
        max_idx = probabilities.index(max_prob)
        peak_point = forecast_points[max_idx]

        if last_prob - first_prob > 8.0:
            trend = "INCREASING"
        elif first_prob - last_prob > 8.0:
            trend = "DECREASING"
        else:
            trend = "STABLE"

        return {
            'generated_at': now.strftime('%Y-%m-%d %H:%M:%S'),
            'baseline_risk_probability': base_telemetry.get('risk_probability', probabilities[0]),
            'overall_trend': trend,
            'peak_risk_horizon': peak_point['label'],
            'peak_risk_timestamp': peak_point['target_timestamp'],
            'peak_risk_probability': max_prob,
            'peak_risk_level': peak_point['forecasted_risk'],
            'forecast_points': forecast_points,
            'executive_insight': (
                # pyrefly: ignore [missing-attribute]
                f"24-hour scaling risk trajectory is {trend}. Peak scaling risk of {max_prob}% ({peak_point['forecasted_risk']}) "
                f"is anticipated at {peak_point['target_timestamp']} ({peak_point['label']}) driven by {peak_point['driving_factor'].lower()} "
                f"Preemptive blending shift to {peak_point['recommended_freshwater_ratio']}% Freshwater is recommended."
            )
        }

forecast_service = RiskForecastService()
