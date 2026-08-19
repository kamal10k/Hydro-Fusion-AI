import math

class WaterBlendingOptimizer:
    # Economic cost benchmarks
    COST_PER_LITER_FRESHWATER_INR = 0.08   # ₹0.08 per liter
    COST_PER_LITER_FRESHWATER_USD = 0.001  # $0.001 per liter

    @staticmethod
    def calculate_optimal_blend(scaling_risk_label, risk_probability, tds, ph, conductivity, daily_water_usage, cooling_cycles=15):
        """
        Calculates optimal Freshwater vs. Greywater blending ratio, cost savings (₹/INR),
        cooling efficiency, and verifies safety constraints.
        """
        risk_prob = float(risk_probability)
        tds_val = float(tds)
        ph_val = float(ph)
        cond_val = float(conductivity)
        usage = float(daily_water_usage)
        cycles = float(cooling_cycles)
        
        base_freshwater = risk_prob * 0.70
        tds_penalty = max(0.0, (tds_val - 450.0) / 25.0)
        ph_penalty = max(0.0, (ph_val - 7.5) * 15.0)
        cycle_penalty = max(0.0, (cycles - 8.0) * 1.5)
        
        raw_freshwater = base_freshwater + tds_penalty + ph_penalty + cycle_penalty
        
        # Hard Safety Guardrails based on Multi-Tier Risk Level
        is_safety_override = False
        if scaling_risk_label == "CRITICAL" or risk_prob >= 80.0:
            freshwater_ratio = min(max(raw_freshwater, 85.0), 95.0)
            is_safety_override = True
        elif scaling_risk_label == "HIGH" or risk_prob >= 55.0:
            freshwater_ratio = min(max(raw_freshwater, 65.0), 90.0)
            is_safety_override = True
        elif scaling_risk_label == "MEDIUM":
            freshwater_ratio = min(max(raw_freshwater, 45.0), 65.0)
        else:
            freshwater_ratio = min(max(raw_freshwater, 15.0), 45.0)
            
        freshwater_ratio = float(round(freshwater_ratio / 5.0) * 5.0)
        freshwater_ratio = min(max(freshwater_ratio, 10.0), 95.0)
        greywater_ratio = round(100.0 - freshwater_ratio, 1)
        
        # Volumetric calculations
        freshwater_liters = round((freshwater_ratio / 100.0) * usage, 1)
        greywater_liters = round((greywater_ratio / 100.0) * usage, 1)
        
        # Cost Savings Calculations
        cost_savings_inr = round(greywater_liters * WaterBlendingOptimizer.COST_PER_LITER_FRESHWATER_INR, 2)
        cost_savings_usd = round(greywater_liters * WaterBlendingOptimizer.COST_PER_LITER_FRESHWATER_USD, 2)
        
        # Cooling Efficiency Rating (scales inversely with severe mineral saturation)
        cooling_efficiency = round(min(max(98.5 - (risk_prob * 0.12) - (tds_val / 200.0), 75.0), 99.0), 1)
        
        # Safety & Rationale Disclaimers
        disclaimer = "The ratio is an AI optimization recommendation. Safety constraints enforce minimum freshwater dilution during elevated mineral saturation."
        
        if is_safety_override:
            rationale = (
                f"SAFETY OVERRIDE ACTIVE: Elevated scaling risk ({risk_prob}%, {scaling_risk_label}) requires "
                f"{freshwater_ratio}% Freshwater dilution to prevent irreversible CaCO3 deposition and protect plate heat exchangers."
            )
        else:
            rationale = (
                f"OPTIMAL RECOVERY: Operating under safe mineral thresholds ({risk_prob}%, {scaling_risk_label}). "
                f"Conserves {greywater_liters:,.0f} L/day of freshwater, saving ₹{cost_savings_inr:,.2f}/day with {cooling_efficiency}% cooling efficiency."
            )
            
        return {
            'freshwater_ratio': freshwater_ratio,
            'greywater_ratio': greywater_ratio,
            'freshwater_daily_liters': freshwater_liters,
            'greywater_daily_liters': greywater_liters,
            'cost_savings_inr': cost_savings_inr,
            'cost_savings_usd': cost_savings_usd,
            'cooling_efficiency_pct': cooling_efficiency,
            'safety_override_active': is_safety_override,
            'rationale': rationale,
            'disclaimer': disclaimer
        }

optimizer = WaterBlendingOptimizer()
