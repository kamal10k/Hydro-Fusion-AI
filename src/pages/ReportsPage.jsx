import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileText, Printer, Download, Droplets, ShieldAlert, 
  CheckCircle2, BrainCircuit, Clock, IndianRupee 
} from 'lucide-react';

export const ReportsPage = () => {
  const [report, setReport] = useState({
    report_title: 'HYDROFUSION AI - DIGITAL CHEMIST WATER MANAGEMENT REPORT',
    generated_at: '2026-08-19 10:00:00',
    user: { name: 'Dr. Alex Vance', role: 'Admin', email: 'alex.vance@hydrofusion.ai' },
    prediction_id: 1,
    created_at: '2026-08-19 08:30:00',
    input_parameters: {
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
    },
    ai_prediction: {
      scaling_prediction: 'HIGH',
      risk_probability: 87.5,
      confidence_score: 96.5,
      system_status: 'Attention Required'
    },
    water_blending: {
      freshwater_ratio: 80.0,
      greywater_ratio: 20.0,
      freshwater_daily_liters: 4160.0,
      greywater_daily_liters: 1040.0,
      cost_savings_inr: 83.2,
      cost_savings_usd: 1.0,
      cooling_efficiency_pct: 95.2
    },
    explainable_ai: {
      summary: 'Primary scaling driver is Total Dissolved Solids contributing 32.5% of total risk index.',
      primary_contributors: [
        { name: 'Total Dissolved Solids', value: 750, unit: 'ppm', contribution_pct: 32.5 },
        { name: 'Conductivity', value: 950, unit: 'µS/cm', contribution_pct: 24.8 },
        { name: 'Cooling Cycles', value: 15, unit: 'cycles', contribution_pct: 18.4 }
      ]
    },
    forecasting_summary: {
      overall_trend: 'INCREASING',
      peak_risk_horizon: '+6 Hours (Afternoon Peak)',
      peak_risk_probability: 92.0,
      peak_risk_level: 'CRITICAL',
      executive_insight: '24-hour scaling risk trajectory is INCREASING due to diurnal solar heat peak and compute workload.'
    },
    disclaimer: 'The ratio is an AI optimization recommendation. Safety constraints enforce minimum freshwater dilution during elevated mineral saturation.'
  });

  useEffect(() => {
    api.getReportData()
      .then(res => {
        if (res) setReport(res);
      })
      .catch(() => {});
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isHighOrCrit = report.ai_prediction.scaling_prediction === 'HIGH' || report.ai_prediction.scaling_prediction === 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Printable Actions Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={22} color="#00f2fe" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Executive Water Management & Scaling Report (PDF Ready)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Certified system report layout for facility engineering audit and regulatory documentation.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print / Export PDF Report
        </button>
      </div>

      {/* Printable Document Container */}
      <div className="glass-panel" style={{ padding: '2.5rem', background: '#0b0f19', border: '1px solid var(--border-color)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary-cyan)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00f2fe', letterSpacing: '0.05em' }}>
              {report.report_title}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Data Center Cooling & Water Quality Optimization Audit Document
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Generated: <strong style={{ color: '#f8fafc' }}>{report.generated_at}</strong></div>
            <div>Operator: <strong style={{ color: '#f8fafc' }}>{report.user.name} ({report.user.role})</strong></div>
            <div>Prediction ID: <strong style={{ color: '#00f2fe' }}>#{report.prediction_id}</strong></div>
          </div>
        </div>

        {/* Executive Summary Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${isHighOrCrit ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}` }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ML Scaling Risk Tier</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isHighOrCrit ? '#f43f5e' : '#10b981', marginTop: '0.3rem' }}>
              {report.ai_prediction.scaling_prediction} ({report.ai_prediction.risk_probability}%)
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Confidence: {report.ai_prediction.confidence_score || 96.5}%</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.4)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Optimal Blending Ratio</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.3rem' }}>
              {report.water_blending.freshwater_ratio}% Fresh / {report.water_blending.greywater_ratio}% Grey
            </div>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{report.water_blending.cooling_efficiency_pct || 95.2}% Efficiency</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Cost Savings</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.3rem' }}>
              ₹{report.water_blending.cost_savings_inr || 83.2}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Saves {report.water_blending.greywater_daily_liters?.toLocaleString()} L freshwater</span>
          </div>
        </div>

        {/* Input Parameters Table */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          Input Telemetry & Water Quality Chemistry
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>GPU Temperature</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.gpu_temperature} °C</td>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>TDS (Total Dissolved Solids)</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.tds} ppm</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>GPU Power Load</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.gpu_power_load} %</td>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>pH Level</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.ph}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>Ambient Temp & Humidity</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.ambient_temperature}°C / {report.input_parameters.humidity}%</td>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>Conductivity</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.conductivity} µS/cm</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>Cooling Water Temp</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.water_temperature} °C</td>
              <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>Cooling Cycles & Age</td>
              <td style={{ padding: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{report.input_parameters.cooling_cycles} cycles / {report.input_parameters.tower_age} yrs</td>
            </tr>
          </tbody>
        </table>

        {/* Explainable AI & 24h Forecast Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <BrainCircuit size={16} color="#a78bfa" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Explainable AI (XAI) Attribution</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              {report.explainable_ai?.summary}
            </p>
            {report.explainable_ai?.primary_contributors?.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                <span style={{ color: '#cbd5e1' }}>{c.name}</span>
                <span style={{ color: '#00f2fe', fontWeight: 700 }}>+{c.contribution_pct}%</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} color="#00f2fe" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>24-Hour Predictive Trajectory</h4>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>Overall Trend: <strong style={{ color: report.forecasting_summary?.overall_trend === 'INCREASING' ? '#f43f5e' : '#10b981' }}>{report.forecasting_summary?.overall_trend}</strong></div>
              <div>Peak Risk Horizon: <strong style={{ color: '#f8fafc' }}>{report.forecasting_summary?.peak_risk_horizon}</strong></div>
              <div>Peak Magnitude: <strong style={{ color: '#f43f5e' }}>{report.forecasting_summary?.peak_risk_probability}% ({report.forecasting_summary?.peak_risk_level})</strong></div>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          * Disclaimer: {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
