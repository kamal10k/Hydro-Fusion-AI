import React, { useState } from 'react';
import { api } from '../services/api';
import { ExplainableAIWidget } from '../components/ExplainableAIWidget';
import { 
  Sliders, ArrowRightLeft, Sparkles, CheckCircle2, AlertTriangle, 
  Droplets, IndianRupee, ShieldCheck, HelpCircle, RefreshCw
} from 'lucide-react';

export const WhatIfPage = () => {
  const [baseline, setBaseline] = useState({
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
    daily_water_usage: 5200.0,
    scaling_prediction: 'HIGH',
    risk_probability: 87.5,
    freshwater_ratio: 80.0,
    greywater_ratio: 20.0,
    cost_savings_inr: 83.2
  });

  const [simParams, setSimParams] = useState({ ...baseline });
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setSimParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulate(simParams);
      setSimResult(res);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return '#f43f5e';
    if (level === 'HIGH') return '#fb7185';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const costDelta = simResult ? (simResult.cost_savings_inr - baseline.cost_savings_inr) : 0;
  const riskDelta = simResult ? (simResult.risk_probability - baseline.risk_probability) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Simulation Sandbox Notice Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        background: 'rgba(139, 92, 246, 0.12)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: 'rgba(139, 92, 246, 0.3)',
            color: '#c4b5fd',
            border: '1px solid rgba(139, 92, 246, 0.5)'
          }}>
            FEATURE 7 • WHAT-IF SIMULATOR
          </span>
          <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>
            SIMULATION SANDBOX — NO PRODUCTION DATA MODIFIED
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
          Modify parameters below to forecast operational & financial outcomes.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Interactive Sliders Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Adjust Telemetry Sliders
          </h3>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>Total Dissolved Solids (TDS)</span>
              <strong style={{ color: '#00f2fe' }}>{simParams.tds} ppm</strong>
            </div>
            <input type="range" min="200" max="1200" step="10" name="tds" value={simParams.tds} onChange={handleSliderChange} style={{ width: '100%', accentColor: '#00f2fe' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>pH Level</span>
              <strong style={{ color: '#00f2fe' }}>{simParams.ph}</strong>
            </div>
            <input type="range" min="6.5" max="9.0" step="0.1" name="ph" value={simParams.ph} onChange={handleSliderChange} style={{ width: '100%', accentColor: '#00f2fe' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>Cooling Cycles</span>
              <strong style={{ color: '#00f2fe' }}>{simParams.cooling_cycles} cycles</strong>
            </div>
            <input type="range" min="2" max="25" step="1" name="cooling_cycles" value={simParams.cooling_cycles} onChange={handleSliderChange} style={{ width: '100%', accentColor: '#00f2fe' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>GPU Temperature</span>
              <strong style={{ color: '#00f2fe' }}>{simParams.gpu_temperature} °C</strong>
            </div>
            <input type="range" min="50" max="95" step="1" name="gpu_temperature" value={simParams.gpu_temperature} onChange={handleSliderChange} style={{ width: '100%', accentColor: '#00f2fe' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>GPU Power Load</span>
              <strong style={{ color: '#00f2fe' }}>{simParams.gpu_power_load} %</strong>
            </div>
            <input type="range" min="30" max="100" step="1" name="gpu_power_load" value={simParams.gpu_power_load} onChange={handleSliderChange} style={{ width: '100%', accentColor: '#00f2fe' }} />
          </div>

          <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <ArrowRightLeft size={18} /> Simulate What-If Scenario
          </button>
        </div>

        {/* Side-by-Side Comparison Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Baseline vs. What-If Outcome Comparison
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Baseline */}
            <div style={{ background: 'rgba(7, 10, 18, 0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current Baseline</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.4rem' }}>
                HIGH RISK ({baseline.risk_probability}%)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#f8fafc', marginTop: '0.4rem' }}>
                Blend: <strong>{baseline.freshwater_ratio}% Fresh / {baseline.greywater_ratio}% Grey</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 700 }}>
                Savings: ₹{baseline.cost_savings_inr}/day
              </div>
            </div>

            {/* Simulated */}
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
              <span style={{ fontSize: '0.75rem', color: '#00f2fe', textTransform: 'uppercase', fontWeight: 700 }}>Simulated What-If</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getRiskColor(simResult?.scaling_prediction || 'HIGH'), marginTop: '0.4rem' }}>
                {simResult ? `${simResult.scaling_prediction} RISK (${simResult.risk_probability}%)` : 'Run Simulation'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#f8fafc', marginTop: '0.4rem' }}>
                Blend: <strong>{simResult ? `${simResult.freshwater_ratio}% Fresh / ${simResult.greywater_ratio}% Grey` : 'N/A'}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 700 }}>
                Savings: {simResult ? `₹${simResult.cost_savings_inr}/day` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Delta Summary Badges */}
          {simResult && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: riskDelta <= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${riskDelta <= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>RISK DELTA</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: riskDelta <= 0 ? '#10b981' : '#f43f5e' }}>
                  {riskDelta > 0 ? `+${riskDelta.toFixed(1)}%` : `${riskDelta.toFixed(1)}%`}
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: costDelta >= 0 ? 'rgba(0, 242, 254, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${costDelta >= 0 ? 'rgba(0, 242, 254, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>COST SAVINGS DELTA</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: costDelta >= 0 ? '#00f2fe' : '#f59e0b' }}>
                  {costDelta >= 0 ? `+₹${costDelta.toFixed(2)}/day` : `-₹${Math.abs(costDelta).toFixed(2)}/day`}
                </div>
              </div>
            </div>
          )}

          {simResult && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.3rem' }}>
                <Sparkles size={16} /> What-If Insight:
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {simResult.rationale}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Explainable AI Component */}
      {simResult && (
        <ExplainableAIWidget contributions={simResult.feature_contributions} />
      )}
    </div>
  );
};
