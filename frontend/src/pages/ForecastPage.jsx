import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Clock, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, 
  Activity, Droplets, Zap, ArrowRight, RefreshCw, BarChart3, ChevronRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const ForecastPage = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecast = async () => {
    try {
      setRefreshing(true);
      const data = await api.getForecast24h();
      setForecast(data);
    } catch (err) {
      console.error('Failed to load 24h forecast:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return '#f43f5e';
    if (level === 'HIGH') return '#fb7185';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const chartData = forecast ? {
    labels: ['Current', '+1h (Immediate)', '+6h (Peak Sun)', '+12h (Night)', '+24h (Diurnal)'],
    datasets: [
      {
        label: 'Scaling Risk Probability (%)',
        data: [
          forecast.baseline_risk_probability || 87.5,
          ...forecast.forecast_points.map(p => p.risk_probability)
        ],
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00f2fe',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Critical Threshold (80%)',
        data: [80, 80, 80, 80, 80],
        borderColor: 'rgba(244, 63, 94, 0.6)',
        borderDash: [6, 6],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      },
      {
        label: 'High Threshold (55%)',
        data: [55, 55, 55, 55, 55],
        borderColor: 'rgba(245, 158, 11, 0.6)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', boxWidth: 14, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(7, 10, 18, 0.95)',
        titleColor: '#00f2fe',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(0, 242, 254, 0.3)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', callback: (v) => `${v}%` }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge-tag">FEATURE 5 • PREDICTIVE AI</span>
            <span className="badge-tag" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
              24-HOUR FORECASTING
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>
            24-Hour Scaling Risk Trajectory & Predictive Blending
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Predictive mineral supersaturation modeling incorporating solar ambient temperature cycles, GPU batch workload curves, and concentration accumulation.
          </p>
        </div>

        <button 
          onClick={fetchForecast} 
          disabled={refreshing}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'pulse-active' : ''} />
          <span>Refresh Forecast</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="pulse-active" style={{ margin: '0 auto 0.5rem' }} />
          Loading 24-hour predictive trajectory...
        </div>
      ) : forecast && (
        <>
          {/* Executive Trajectory Banner */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(7, 10, 18, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderColor: forecast.overall_trend === 'INCREASING' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(0, 242, 254, 0.3)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>OVERALL TRAJECTORY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                {forecast.overall_trend === 'INCREASING' ? (
                  <TrendingUp size={22} color="#f43f5e" />
                ) : (
                  <TrendingDown size={22} color="#10b981" />
                )}
                <span style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: forecast.overall_trend === 'INCREASING' ? '#f43f5e' : '#10b981'
                }}>
                  {forecast.overall_trend}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PEAK RISK HORIZON</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {forecast.peak_risk_horizon}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {forecast.peak_risk_timestamp}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PEAK RISK MAGNITUDE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: getRiskColor(forecast.peak_risk_level) }}>
                  {forecast.peak_risk_probability}%
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: `${getRiskColor(forecast.peak_risk_level)}20`,
                  color: getRiskColor(forecast.peak_risk_level),
                  border: `1px solid ${getRiskColor(forecast.peak_risk_level)}40`
                }}>
                  {forecast.peak_risk_level}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>RECOMMENDED MITIGATION</span>
              <div style={{ fontSize: '0.85rem', color: '#00f2fe', fontWeight: 600, marginTop: '0.25rem', lineHeight: 1.3 }}>
                Shift blending ratio to 85% Freshwater before peak solar heat window.
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="#00f2fe" /> 24-Hour Projected Risk Probability Curve
            </h3>
            <div style={{ height: '280px', width: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* 4 Time Horizon Timeline Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {forecast.forecast_points.map((pt, idx) => {
              const riskColor = getRiskColor(pt.forecasted_risk);
              return (
                <div key={idx} className="glass-panel" style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderTop: `3px solid ${riskColor}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Clock size={16} color="#00f2fe" />
                      {pt.label}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: `${riskColor}20`,
                      color: riskColor,
                      border: `1px solid ${riskColor}40`
                    }}>
                      {pt.forecasted_risk} ({pt.risk_probability}%)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Target: {pt.target_timestamp}
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(7, 10, 18, 0.6)',
                    fontSize: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Projected TDS:</span>
                      <p style={{ color: '#f8fafc', fontWeight: 700 }}>{pt.projected_tds} ppm</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Projected pH:</span>
                      <p style={{ color: '#f8fafc', fontWeight: 700 }}>{pt.projected_ph}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Blend (Fresh/Grey):</span>
                      <p style={{ color: '#00f2fe', fontWeight: 700 }}>{pt.recommended_freshwater_ratio}% / {pt.recommended_greywater_ratio}%</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Est. Savings:</span>
                      <p style={{ color: '#10b981', fontWeight: 700 }}>₹{pt.cost_savings_inr}/day</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    <strong>Key Driver:</strong> {pt.driving_factor}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AI Executive Insight Card */}
          <div className="glass-panel" style={{
            padding: '1.25rem',
            background: 'rgba(0, 242, 254, 0.04)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="#00f2fe" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe', marginBottom: '0.25rem' }}>
                AI Digital Chemist Forecast Recommendation
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#f8fafc', lineHeight: 1.5 }}>
                {forecast.executive_insight}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
