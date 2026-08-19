import os
import numpy as np
import pandas as pd

def generate_cooling_water_dataset(num_samples=2500, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Operational & Thermal Telemetry
    gpu_temperature = np.random.uniform(50.0, 95.0, num_samples)
    gpu_power_load = np.random.uniform(30.0, 100.0, num_samples)
    ambient_temperature = np.random.uniform(15.0, 45.0, num_samples)
    humidity = np.random.uniform(20.0, 90.0, num_samples)
    
    # Water temperature correlates with GPU temp and ambient temp
    water_temperature = 0.25 * gpu_temperature + 0.35 * ambient_temperature + np.random.normal(5, 2, num_samples)
    water_temperature = np.clip(water_temperature, 15.0, 42.0)
    
    # 2. Water Quality Parameters
    tds = np.random.uniform(200.0, 1400.0, num_samples)
    ph = np.random.uniform(6.5, 9.2, num_samples)
    
    # Conductivity strongly correlates with TDS (~1.25 to 1.45 x TDS)
    conductivity = tds * np.random.uniform(1.25, 1.45, num_samples)
    
    # 3. Cooling System Dynamics
    tower_age = np.random.uniform(0.5, 15.0, num_samples)
    cooling_cycles = np.random.uniform(2.0, 22.0, num_samples)
    flow_rate = np.random.uniform(40.0, 200.0, num_samples)
    daily_water_usage = np.random.uniform(1500.0, 9000.0, num_samples)
    
    # 4. Physicochemical Scaling Risk Rule (Ground Truth Generation)
    # Langelier Saturation Index (LSI) proxy calculation:
    # LSI > 0 indicates supersaturated water with potential to deposit calcium carbonate scale.
    # Higher pH, higher TDS, higher water temp, and higher cycles increase LSI dramatically.
    
    # Temperature factor
    tf = (np.log10(water_temperature + 273.15) * 1.5) - 3.8
    # TDS factor
    tds_f = (np.log10(tds) - 1) / 10.0
    # Calcium / Alkalinity estimation proxy from TDS and cooling cycles
    calcium_est = tds * 0.35 * (cooling_cycles / 5.0)
    alkalinity_est = tds * 0.25 * (cooling_cycles / 5.0)
    
    calc_f = np.log10(np.maximum(calcium_est, 10.0)) - 0.4
    alk_f = np.log10(np.maximum(alkalinity_est, 10.0))
    
    phs = (9.3 + tds_f + tf) - (calc_f + alk_f)
    lsi = ph - phs
    
    # Localized Heat Exchange Stress Factor (high GPU power + high water temp + low flow rate)
    heat_stress = (gpu_temperature / 90.0) * (gpu_power_load / 100.0) * (150.0 / np.maximum(flow_rate, 40.0))
    
    # Age & fouling factor
    age_factor = tower_age / 20.0
    
    # Total Scaling Index score
    scaling_score = lsi + (heat_stress * 0.8) + (age_factor * 0.5) + (cooling_cycles / 15.0)
    
    # Add minor noise for realistic stochastic variance
    scaling_score += np.random.normal(0, 0.25, num_samples)
    
    # Target classification threshold: 1 = HIGH Scaling Risk, 0 = LOW Scaling Risk
    # Threshold chosen so ~40% high risk, ~60% low risk
    target = (scaling_score > 1.25).astype(int)
    
    df = pd.DataFrame({
        'gpu_temperature': np.round(gpu_temperature, 2),
        'gpu_power_load': np.round(gpu_power_load, 2),
        'ambient_temperature': np.round(ambient_temperature, 2),
        'humidity': np.round(humidity, 2),
        'water_temperature': np.round(water_temperature, 2),
        'tds': np.round(tds, 2),
        'ph': np.round(ph, 2),
        'conductivity': np.round(conductivity, 2),
        'tower_age': np.round(tower_age, 2),
        'cooling_cycles': np.round(cooling_cycles, 2),
        'flow_rate': np.round(flow_rate, 2),
        'daily_water_usage': np.round(daily_water_usage, 2),
        'scaling_risk': target
    })
    
    output_dir = os.path.dirname(__file__)
    csv_path = os.path.join(output_dir, 'cooling_water_dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated successfully with {num_samples} records saved to {csv_path}")
    print(f"Risk distribution: LOW (0): {(df['scaling_risk']==0).sum()}, HIGH (1): {(df['scaling_risk']==1).sum()}")
    return df

if __name__ == "__main__":
    generate_cooling_water_dataset()
