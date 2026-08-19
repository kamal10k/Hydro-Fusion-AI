import os
from backend.config import Config

class GeminiAIService:
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        self.model_name = Config.GEMINI_MODEL
        self.client = None
        self.init_client()
        
    def init_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("Gemini API Client initialized successfully.")
            except Exception as e:
                print(f"Gemini API init error: {e}. Falling back to rule-based AI synthesis engine.")
                self.client = None
        else:
            print("No GEMINI_API_KEY set. Operating in intelligent fallback AI synthesis mode.")
            self.client = None
            
    def generate_scaling_explanation(self, input_params, prediction_result, blending_result):
        """
        Generates explanation and maintenance recommendations.
        """
        risk_label = prediction_result.get('scaling_prediction', 'UNKNOWN')
        risk_prob = prediction_result.get('risk_probability', 0.0)
        fresh_pct = blending_result.get('freshwater_ratio', 50)
        grey_pct = blending_result.get('greywater_ratio', 50)
        
        gpu_temp = input_params.get('gpu_temperature', 0)
        gpu_power = input_params.get('gpu_power_load', 0)
        tds = input_params.get('tds', 0)
        ph = input_params.get('ph', 0)
        cond = input_params.get('conductivity', 0)
        cycles = input_params.get('cooling_cycles', 0)
        
        if self.client:
            try:
                prompt = f"""
                You are HydroFusion AI - The Digital Chemist, an expert AI water management assistant for AI data center cooling systems.
                
                Analyze the following data center and water parameters:
                - GPU Temperature: {gpu_temp}°C
                - GPU Power Load: {gpu_power}%
                - Water TDS: {tds} ppm
                - Water pH: {ph}
                - Conductivity: {cond} µS/cm
                - Cooling Cycles: {cycles}
                - ML Predicted Scaling Risk: {risk_label} ({risk_prob}%)
                - Recommended Blending Ratio: {fresh_pct}% Freshwater / {grey_pct}% Greywater
                
                Please provide:
                1. A clear 2-sentence explanation of why the scaling risk is {risk_label}.
                2. Three concrete actionable maintenance recommendations for the facility engineering team.
                Keep the tone professional, technical, and precise. Format clearly into 'explanation' and 'recommendations'.
                """
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                if response and response.text:
                    text = response.text.strip()
                    # Parse into explanation and recommendation
                    return {
                        'explanation': text,
                        'source': 'Gemini API'
                    }
            except Exception as e:
                print(f"Gemini API call failed: {e}. Using fallback generator.")
                
        # Rule-Based Intelligent Fallback Synthesis Engine
        if risk_label == "HIGH":
            explanation = (
                f"The current scaling risk is HIGH ({risk_prob}%) because water-quality indicators (TDS: {tds} ppm, pH: {ph}) "
                f"and thermal operating conditions (GPU Temp: {gpu_temp}°C at {gpu_power}% load with {cycles} cooling cycles) "
                f"are contributing to an elevated Langelier mineral saturation tendency."
            )
            recommendations = [
                f"Shift cooling tower supply blending ratio immediately to {fresh_pct}% Freshwater and {grey_pct}% Greywater to reduce total dissolved solids concentration.",
                f"Inspect heat exchanger plates and cooling tower fills for early calcium carbonate nucleation, particularly around high-heat GPU loops ({gpu_temp}°C).",
                f"Increase blowdown frequency or perform chemical scale inhibitor dosing if conductivity exceeds {cond} µS/cm."
            ]
        else:
            explanation = (
                f"The current scaling risk is LOW ({risk_prob}%). Water-quality indicators (TDS: {tds} ppm, pH: {ph}) "
                f"remain well within safe operating limits for the current thermal workload ({gpu_temp}°C, {gpu_power}% power load)."
            )
            recommendations = [
                f"Maintain the optimized blending ratio of {fresh_pct}% Freshwater and {grey_pct}% Greywater to maximize water conservation.",
                f"Continue routine telemetry monitoring of TDS ({tds} ppm) and pH ({ph}).",
                "Ensure standard biocide and corrosion inhibitor dosage regimens are maintained."
            ]
            
        return {
            'explanation': explanation,
            'recommendations': recommendations,
            'source': 'HydroFusion AI Synthetic Chemist Engine'
        }
        
    def generate_chatbot_response(self, question, context_data=None):
        """
        Handles interactive Digital Chemist Chatbot conversations.
        """
        context_str = ""
        if context_data:
            latest = context_data.get('latest_prediction', {})
            if latest:
                context_str = (
                    f"\nCurrent System Context:\n"
                    f"- Scaling Risk: {latest.get('scaling_prediction', 'N/A')} ({latest.get('risk_probability', 'N/A')}%)\n"
                    f"- Blending Ratio: {latest.get('freshwater_ratio', 'N/A')}% Fresh / {latest.get('greywater_ratio', 'N/A')}% Grey\n"
                    f"- TDS: {latest.get('tds', 'N/A')} ppm, pH: {latest.get('ph', 'N/A')}, Conductivity: {latest.get('conductivity', 'N/A')} µS/cm\n"
                    f"- GPU Temp: {latest.get('gpu_temperature', 'N/A')}°C, GPU Power: {latest.get('gpu_power_load', 'N/A')}%\n"
                    f"- Cooling Cycles: {latest.get('cooling_cycles', 'N/A')}, Flow Rate: {latest.get('flow_rate', 'N/A')} L/min\n"
                )

        if self.client:
            try:
                system_prompt = (
                    "You are HydroFusion AI - The Digital Chemist, an expert AI assistant specializing in data center cooling systems, "
                    "water treatment, mineral scaling kinetics, and freshwater-greywater optimization. "
                    "Answer user questions accurately, professionally, and concisely."
                    f"{context_str}"
                )
                full_prompt = f"{system_prompt}\n\nUser Question: {question}"
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"Gemini Chatbot call failed: {e}. Using fallback chat engine.")
                
        # Smart Fallback Conversational Engine for offline/no-key environment
        q_lower = question.lower()
        
        if "why" in q_lower and "high" in q_lower:
            return (
                "The scaling risk is high because elevated total dissolved solids (TDS), high pH levels, "
                "and high cooling cycles increase mineral supersaturation. When combined with elevated GPU thermal loads, "
                "minerals like calcium carbonate precipitate rapidly on heat exchange surfaces. Shift to an 80% freshwater ratio "
                "to dilute the mineral index."
            )
        elif "ratio" in q_lower or "blend" in q_lower or "freshwater" in q_lower or "greywater" in q_lower:
            return (
                "The recommended blending ratio balances freshwater preservation with thermal scaling safety. "
                "During high-risk conditions, we increase freshwater dilution (e.g. 80% Fresh / 20% Grey). "
                "Under normal low-risk conditions, greywater reuse can safely be increased up to 70% to conserve municipal freshwater."
            )
        elif "ph" in q_lower or "tds" in q_lower or "conductivity" in q_lower:
            return (
                "Water quality parameters directly control scaling potential. Alkaline pH (>8.0) and high TDS (>700 ppm) "
                "significantly reduce mineral solubility. Keeping pH between 7.0 and 7.6 and maintaining conductivity below 900 µS/cm "
                "greatly lowers scale formation risk."
            )
        elif "gpu" in q_lower or "temp" in q_lower or "power" in q_lower:
            return (
                "GPU temperature and power load dictate the heat flux delivered to the cooling tower. "
                "At GPU temperatures above 80°C and power loads above 85%, localized water heating accelerates chemical reaction rates, "
                "causing inverse-solubility minerals (like CaSO4 and CaCO3) to deposit faster on cooling plates."
            )
        else:
            return (
                f"As HydroFusion AI Digital Chemist, I have evaluated your prompt: '{question}'. "
                "Based on current cooling parameters, maintaining proper mineral balance, regular blowdown cycles, "
                "and following the recommended freshwater-greywater ratio will optimize cooling efficiency and extend tower lifespan."
            )

gemini_service = GeminiAIService()
