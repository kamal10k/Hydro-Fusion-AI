import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { RatioDonut } from '../components/RatioDonut';
import { WaterQualityCards } from '../components/WaterQualityCards';
import { CoolingParamsCards } from '../components/CoolingParamsCards';
import { ExplainableAIWidget } from '../components/ExplainableAIWidget';
import { 
  Activity, AlertTriangle, ShieldCheck, Droplets, ArrowRight, 
  Bot, Sparkles, RefreshCw, Radio, Zap, IndianRupee, Clock, Layers
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

export const DashboardPage = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    total_predictions: 18,
    high_risk_cases: 7,
    low_risk_cases: 11,
    average_risk_probability: 44.8,
    average_daily_water_usage: 5200.0,
    daily_greywater_saved_liters: 1820.0,
    daily_cost_savings_inr: 145.6,
    latest_prediction: {
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
      confidence_score: 96.5,
      freshwater_ratio: 80.0,
      greywater_ratio: 20.0,
      cost_savings_inr: 145.6,
      created_at: 'Just now'
    }
  });

  const [isSimulatedStream, setIsSimulatedStream] = useState(false);
  const [loading, setLoading] = useState(false);
  const streamTimerRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  // Simulated live telemetry generator
  useEffect(() => {
    if (isSimulatedStream) {
      streamTimerRef.current = setInterval(() => {
        setStats(prev => {
          const prevLatest = prev.latest_prediction || {};
          const jitterTds = Math.round(Math.min(Math.max((prevLatest.tds || 750) + (Math.random() * 20 - 10), 400), 950));
          const jitterGpuTemp = Math.round((prevLatest.gpu_temperature || 85) + (Math.random() * 2 - 1));
          const jitterProb = Math.min(Math.max(Math.round(((prevLatest.risk_probability || 87.5) + (Math.random() * 4 - 2)) * 10) / 10, 10), 99);
          
          let tier = 'LOW';
          if (jitterProb >= 80) tier = 'CRITICAL';
          else if (jitterProb >= 55) tier = 'HIGH';
          else if (jitterProb >= 25) tier = 'MEDIUM';

          return {
            ...prev,
            latest_prediction: {
              ...prevLatest,
              tds: jitterTds,
              gpu_temperature: jitterGpuTemp,
              risk_probability: jitterProb,
              scaling_prediction: tier,
              created_at: 'Streamed Live'
            }
          };
        });
      }, 3000);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isSimulatedStream]);

  const fetchStats = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(data => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const latest = stats.latest_prediction || {};
  const riskTier = latest.scaling_prediction || 'HIGH';
  const isHighOrCrit = riskTier === 'HIGH' || riskTier === 'CRITICAL';

  const chartData = {
    labels: ['Log-01', 'Log-02', 'Log-03', 'Log-04', 'Log-05', 'Current Telemetry'],
    datasets: [
      {
        label: 'Risk Probability (%)',
        data: [18.2, 24.5, 62.8, 41.0, 94.1, latest.risk_probability || 87.5],
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00f2fe',
        pointRadius: 5
      },
      {
        label: 'TDS Concentration (ppm / 10)',
        data: [42, 48, 61, 52, 88, (latest.tds || 750) / 10],
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(0, 242, 254, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Live Stream Mode Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            background: isSimulatedStream ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isSimulatedStream ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
          }}>
            <Radio size={14} color={isSimulatedStream ? '#f59e0b' : '#10b981'} className={isSimulatedStream ? 'pulse-active' : ''} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isSimulatedStream ? '#f59e0b' : '#10b981' }}>
              {isSimulatedStream ? 'DEMO / SIMULATED DATA STREAM' : 'LIVE SENSOR TELEMETRY'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isSimulatedStream ? 'Synthetic 3-second IoT telemetry stream active' : 'Connected to cooling tower PLC & thermal sensors'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsSimulatedStream(!isSimulatedStream)}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              borderColor: isSimulatedStream ? '#f59e0b' : 'var(--border-color)',
              color: isSimulatedStream ? '#f59e0b' : '#f8fafc'
            }}
          >
            {isSimulatedStream ? 'Switch to Live Database Data' : 'Enable Simulated Data Stream'}
          </button>
          <button onClick={fetchStats} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
            <RefreshCw size={13} className={loading ? 'pulse-active' : ''} />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Audit Analyses
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '0.3rem 0' }}>
            {stats.total_predictions}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: 600 }}>
            Active Telemetry Logs
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            High & Critical Cases
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e', margin: '0.3rem 0' }}>
            {stats.high_risk_cases}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 600 }}>
            {Math.round((stats.high_risk_cases / (stats.total_predictions || 1)) * 100)}% of Total Scans
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Greywater Saved
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0' }}>
            {stats.daily_greywater_saved_liters.toLocaleString()} L/day
          </div>
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
            Freshwater Preserved
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Daily Cost Savings
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00f2fe', margin: '0.3rem 0' }}>
            ₹{stats.daily_cost_savings_inr || 145.6}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: 600 }}>
            Direct Municipal Utility Reduction
          </span>
        </div>
      </div>

      {/* Main Analysis Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <RiskGauge riskLabel={latest.scaling_prediction} probability={latest.risk_probability} />
        <RatioDonut freshRatio={latest.freshwater_ratio} greyRatio={latest.greywater_ratio} dailyUsage={latest.daily_water_usage} />
      </div>

      {/* 24-Hour Mini Forecast & XAI Preview Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* XAI Preview */}
        <ExplainableAIWidget contributions={latest.feature_contributions} />

        {/* 24h Forecast Quick Jump */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#00f2fe" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  24-Hour Predictive Risk Forecast
                </h3>
              </div>
              <span className="badge-tag" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', borderColor: 'rgba(0, 242, 254, 0.3)' }}>
                FEATURE 5
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Our predictive model projects diurnal solar ambient temperature curves, scheduled compute workloads, and cycle accumulation to anticipate supersaturation peaks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(7, 10, 18, 0.6)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>+1h</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e' }}>88%</p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(7, 10, 18, 0.6)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>+6h (Peak)</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e' }}>92%</p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(7, 10, 18, 0.6)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>+12h</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>74%</p>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(7, 10, 18, 0.6)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>+24h</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e' }}>85%</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('forecast')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem' }}
          >
            Open 24h Forecasting Engine <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Gemini AI Corrective Actions Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: `4px solid ${isHighOrCrit ? '#f43f5e' : '#10b981'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="#a78bfa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Digital Chemist AI Analysis & Corrective Actions
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
                Google Gemini API Synthesis Engine
              </span>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => setActiveTab('chat')} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
            Ask Digital Chemist <ArrowRight size={14} />
          </button>
        </div>

        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {isHighOrCrit ? (
            `The current scaling risk is ${riskTier} (${latest.risk_probability}% probability) because elevated total dissolved solids (${latest.tds} ppm) and alkaline pH (${latest.ph}) coincide with high thermal GPU workload (${latest.gpu_temperature}°C at ${latest.gpu_power_load}% power load). At ${latest.cooling_cycles} cooling cycles, mineral supersaturation occurs rapidly.`
          ) : (
            `Operating parameters are within normal mineral solubility bounds (${latest.risk_probability}% scaling probability). Low TDS (${latest.tds} ppm) and balanced pH (${latest.ph}) allow safe cooling operations.`
          )}
        </p>

        <div style={{ background: 'rgba(7, 10, 18, 0.5)', borderRadius: '12px', padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
            Actionable Preventive Maintenance Recommendations:
          </span>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Maintain recommended blending ratio of {latest.freshwater_ratio}% Freshwater / {latest.greywater_ratio}% Greywater to suppress mineral precipitation.</li>
            <li>Inspect high-heat GPU cooling loops ({latest.gpu_temperature}°C) for micro-scale deposit formation.</li>
            <li>Monitor cooling tower blowdown cycles to keep conductivity below 950 µS/cm.</li>
          </ul>
        </div>
      </div>

      {/* Water & Thermal Telemetry */}
      <div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Water Quality Telemetry
        </h3>
        <WaterQualityCards tds={latest.tds} ph={latest.ph} conductivity={latest.conductivity} waterTemp={latest.water_temperature} />
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data Center Thermal & Cooling Dynamics
        </h3>
        <CoolingParamsCards gpuTemp={latest.gpu_temperature} gpuPower={latest.gpu_power_load} ambTemp={latest.ambient_temperature} humidity={latest.humidity} cycles={latest.cooling_cycles} towerAge={latest.tower_age} />
      </div>

      {/* Historical Trend Chart */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem', fontWeight: 700 }}>
          Historical Telemetry vs. Scaling Probability Trend
        </h3>
        <div style={{ height: '280px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
