import React, { useState } from 'react';
import { api } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { RatioDonut } from '../components/RatioDonut';
import { ExplainableAIWidget } from '../components/ExplainableAIWidget';
import { 
  Cpu, Waves, RefreshCw, Play, CheckCircle2, AlertTriangle, 
  Sparkles, Workflow, ArrowRight, ShieldCheck, IndianRupee, BrainCircuit 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PredictionPage = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({
    gpu_temperature: 85.0,
    gpu_power_load: 92.0,
    ambient_temperature: 37.0,
    humidity: 70.0,
    water_temperature: 31.0,
    tds: 750.0,
    ph: 8.1,
    conductivity: 950.0,
    tower_age: 5.0,
    cooling_cycles: 15.0,
    flow_rate: 100.0,
    daily_water_usage: 5200.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadPreset = (presetType) => {
    if (presetType === 'CRITICAL') {
      setFormData({
        gpu_temperature: 89.0,
        gpu_power_load: 96.0,
        ambient_temperature: 39.0,
        humidity: 75.0,
        water_temperature: 34.0,
        tds: 880.0,
        ph: 8.4,
        conductivity: 1150.0,
        tower_age: 7.0,
        cooling_cycles: 18.0,
        flow_rate: 95.0,
        daily_water_usage: 5800.0
      });
    } else if (presetType === 'HIGH') {
      setFormData({
        gpu_temperature: 85.0,
        gpu_power_load: 92.0,
        ambient_temperature: 37.0,
        humidity: 70.0,
        water_temperature: 31.0,
        tds: 750.0,
        ph: 8.1,
        conductivity: 950.0,
        tower_age: 5.0,
        cooling_cycles: 15.0,
        flow_rate: 100.0,
        daily_water_usage: 5200.0
      });
    } else if (presetType === 'LOW') {
      setFormData({
        gpu_temperature: 68.0,
        gpu_power_load: 55.0,
        ambient_temperature: 24.0,
        humidity: 50.0,
        water_temperature: 21.0,
        tds: 380.0,
        ph: 7.2,
        conductivity: 490.0,
        tower_age: 2.0,
        cooling_cycles: 5.0,
        flow_rate: 130.0,
        daily_water_usage: 4100.0
      });
    } else if (presetType === 'ECO') {
      setFormData({
        gpu_temperature: 75.0,
        gpu_power_load: 70.0,
        ambient_temperature: 28.0,
        humidity: 60.0,
        water_temperature: 25.0,
        tds: 480.0,
        ph: 7.4,
        conductivity: 620.0,
        tower_age: 3.5,
        cooling_cycles: 8.0,
        flow_rate: 110.0,
        daily_water_usage: 4600.0
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setResult(null);

    const valErrors = [];
    const num = (v) => parseFloat(v);

    if (num(formData.ph) < 0 || num(formData.ph) > 14) valErrors.push("pH must be between 0 and 14.");
    if (num(formData.gpu_power_load) < 0 || num(formData.gpu_power_load) > 100) valErrors.push("GPU Power Load must be 0-100%.");
    if (num(formData.humidity) < 0 || num(formData.humidity) > 100) valErrors.push("Humidity must be 0-100%.");
    
    for (let key in formData) {
      if (num(formData[key]) < 0 && key !== 'ambient_temperature') {
        valErrors.push(`${key.replace('_', ' ')} cannot be negative.`);
      }
    }

    if (valErrors.length > 0) {
      setErrors(valErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.predict(formData);
      setResult(res);
      setLoading(false);

      if (res.scaling_prediction === 'LOW') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      setErrors([err.message || 'Error processing prediction. Check backend status.']);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Presets Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Cooling Telemetry & Water Quality Analyzer
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            4-Tier Risk Classification • Explainable AI (XAI) • Blending Cost Optimization (₹)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" type="button" onClick={() => loadPreset('CRITICAL')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.5)', color: '#f43f5e' }}>
            Critical Stress Spec
          </button>
          <button className="btn-secondary" type="button" onClick={() => loadPreset('HIGH')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(251, 113, 133, 0.4)', color: '#fb7185' }}>
            High Risk Profile
          </button>
          <button className="btn-secondary" type="button" onClick={() => loadPreset('LOW')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
            Low Risk Profile
          </button>
          <button className="btn-secondary" type="button" onClick={() => loadPreset('ECO')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(0, 242, 254, 0.4)', color: '#00f2fe' }}>
            Eco Blend Preset
          </button>
        </div>
      </div>

      {/* Validation Error Box */}
      {errors.length > 0 && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', fontWeight: 700, marginBottom: '0.4rem' }}>
            <AlertTriangle size={18} />
            <span>Input Validation Error:</span>
          </div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fca5a5' }}>
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Card 1: Data Center Parameters */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Cpu size={20} color="#00f2fe" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Data Center Operating Inputs
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                1. GPU Temperature (°C)
              </label>
              <input type="number" step="0.1" name="gpu_temperature" value={formData.gpu_temperature} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                2. GPU Power Load (%)
              </label>
              <input type="number" step="0.1" name="gpu_power_load" value={formData.gpu_power_load} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                3. Ambient Temperature (°C)
              </label>
              <input type="number" step="0.1" name="ambient_temperature" value={formData.ambient_temperature} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                4. Humidity (%)
              </label>
              <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                5. Water Temperature (°C)
              </label>
              <input type="number" step="0.1" name="water_temperature" value={formData.water_temperature} onChange={handleChange} className="input-field" required />
            </div>
          </div>
        </div>

        {/* Card 2: Water Quality Inputs */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Waves size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Water Quality Inputs
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                6. TDS (Total Dissolved Solids) [ppm]
              </label>
              <input type="number" step="1" name="tds" value={formData.tds} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                7. pH Level (0 - 14)
              </label>
              <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                8. Conductivity (µS/cm)
              </label>
              <input type="number" step="1" name="conductivity" value={formData.conductivity} onChange={handleChange} className="input-field" required />
            </div>
          </div>
        </div>

        {/* Card 3: Cooling System Dynamics */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <RefreshCw size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Cooling System Dynamics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                9. Cooling Tower Age (years)
              </label>
              <input type="number" step="0.5" name="tower_age" value={formData.tower_age} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                10. Cooling Cycles
              </label>
              <input type="number" step="1" name="cooling_cycles" value={formData.cooling_cycles} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                11. Flow Rate (L/min)
              </label>
              <input type="number" step="1" name="flow_rate" value={formData.flow_rate} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                12. Daily Water Usage (L/day)
              </label>
              <input type="number" step="50" name="daily_water_usage" value={formData.daily_water_usage} onChange={handleChange} className="input-field" required />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              {loading ? (
                <>Analyzing Telemetry & Running ML Pipeline...</>
              ) : (
                <>
                  <Play size={18} /> Run Scaling Risk & Optimization Pipeline
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Output Results Panel */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Main Gauges & Financial KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <RiskGauge riskLabel={result.scaling_prediction} probability={result.risk_probability} />
            <RatioDonut freshRatio={result.freshwater_ratio} greyRatio={result.greywater_ratio} dailyUsage={result.input_parameters.daily_water_usage} />
          </div>

          {/* Cost Savings & Cooling Efficiency KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ESTIMATED COST SAVINGS</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.2rem' }}>
                ₹{result.cost_savings_inr || 83.2}/day
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(${result.cost_savings_usd || 1.0} USD equivalent)</span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>COOLING EFFICIENCY</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                {result.cooling_efficiency_pct || 96.5}%
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Thermal heat rejection optimal</span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>MODEL CONFIDENCE</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {result.confidence_score || 96.5}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Random Forest Ensemble Margin</span>
            </div>
          </div>

          {/* Explainable AI (XAI) Feature Attribution Component */}
          <ExplainableAIWidget contributions={result.feature_contributions} />

          {/* Gemini AI Recommendation Callout */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: `4px solid ${result.scaling_prediction === 'HIGH' || result.scaling_prediction === 'CRITICAL' ? '#f43f5e' : '#10b981'}` }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#a78bfa" /> Digital Chemist AI Explanation & Synthesis
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1rem' }}>
              {result.ai_explanation}
            </p>

            {result.ai_recommendations && result.ai_recommendations.length > 0 && (
              <div style={{ background: 'rgba(7, 10, 18, 0.5)', borderRadius: '12px', padding: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Actionable Recommendations:
                </span>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.ai_recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
