import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, TrendingUp, Droplets, IndianRupee, ShieldCheck, 
  Calendar, Layers, Activity, Clock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export const AnalyticsPage = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true);
        const [d, w, m] = await Promise.all([
          api.getDailyAnalytics(),
          api.getWeeklyAnalytics(),
          api.getMonthlyAnalytics()
        ]);
        setDailyData(d);
        setWeeklyData(w);
        setMonthlyData(m);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnalytics();
  }, []);

  const weeklyChartData = weeklyData ? {
    labels: weeklyData.weekly_trend.map(d => d.day),
    datasets: [
      {
        type: 'bar',
        label: 'Total Water Usage (L)',
        data: weeklyData.weekly_trend.map(d => d.water_usage),
        backgroundColor: 'rgba(0, 242, 254, 0.25)',
        borderColor: '#00f2fe',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        type: 'bar',
        label: 'Freshwater Saved (L)',
        data: weeklyData.weekly_trend.map(d => d.saved_liters),
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  } : null;

  const monthlyRiskDoughnut = monthlyData ? {
    labels: ['Low Risk (Safe)', 'Medium Risk (Monitor)', 'High Risk (Alert)', 'Critical Risk (Action)'],
    datasets: [
      {
        data: [
          monthlyData.risk_distribution.low_risk_days_pct,
          monthlyData.risk_distribution.medium_risk_days_pct,
          monthlyData.risk_distribution.high_risk_days_pct,
          monthlyData.risk_distribution.critical_risk_days_pct
        ],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#fb7185',
          '#f43f5e'
        ],
        borderColor: 'rgba(7, 10, 18, 0.8)',
        borderWidth: 2
      }
    ]
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge-tag">FEATURE 10 • ANALYTICS SUITE</span>
            <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              WATER & FINANCIAL METRICS
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>
            Executive Water Management & Cost Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Aggregated water quality parameters, cooling efficiency trends, freshwater conservation indices, and operational financial savings.
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {['daily', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTimeframe(tab)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTimeframe === tab ? 'var(--accent-cyan)' : 'transparent',
                color: activeTimeframe === tab ? '#070a12' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {tab} Analytics
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading executive analytics...
        </div>
      ) : (
        <>
          {/* DAILY TAB */}
          {activeTimeframe === 'daily' && dailyData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>AVERAGE TDS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                    {dailyData.water_quality.avg_tds} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ppm</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Within safe nominal range</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>AVERAGE pH</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                    {dailyData.water_quality.avg_ph}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#00f2fe' }}>Alkalinity balance optimal</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>FRESHWATER PRESERVED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                    {dailyData.water_conservation.freshwater_saved_liters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#10b981' }}>L</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{dailyData.water_conservation.greywater_utilization_pct}% greywater blend</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>DAILY COST SAVINGS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.25rem' }}>
                    ₹{dailyData.water_conservation.estimated_cost_savings_inr}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(${dailyData.water_conservation.estimated_cost_savings_usd} USD equivalent)</span>
                </div>
              </div>

              {/* Water Quality & Thermal Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={18} color="#00f2fe" /> 24h Mineral & Chemical Baselines
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average Conductivity</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dailyData.water_quality.avg_conductivity} µS/cm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average Water Temperature</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dailyData.water_quality.avg_water_temperature} °C</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average GPU Core Temperature</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dailyData.thermal_telemetry.avg_gpu_temperature} °C</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average GPU Power Load</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dailyData.thermal_telemetry.avg_gpu_power_load} %</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="#10b981" /> 24h Risk Distribution & Safety
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Mean Scaling Risk Probability</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dailyData.scaling_risk.avg_risk_probability}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Peak 24h Risk Spike</span>
                      <span style={{ color: '#f43f5e', fontWeight: 700 }}>{dailyData.scaling_risk.max_risk_probability}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Telemetry Scans Executed</span>
                      <span style={{ color: '#00f2fe', fontWeight: 700 }}>{dailyData.total_scans}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>System Operational Status</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{dailyData.scaling_risk.risk_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WEEKLY TAB */}
          {activeTimeframe === 'weekly' && weeklyData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>7-DAY WATER CONSUMPTION</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                    {weeklyData.total_water_consumed_liters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>L</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>7-DAY FRESHWATER PRESERVED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                    {weeklyData.total_freshwater_saved_liters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#10b981' }}>L</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{weeklyData.greywater_recovery_rate_pct}% total recovery rate</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>7-DAY FINANCIAL SAVINGS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.25rem' }}>
                    ₹{weeklyData.total_cost_savings_inr}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Direct municipal freshwater reduction</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>HIGH-RISK INCIDENTS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                    {weeklyData.high_risk_incidents_count}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>100% mitigated via blending</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                  7-Day Water Consumption vs. Freshwater Conservation (Liters)
                </h3>
                <div style={{ height: '300px' }}>
                  <Bar data={weeklyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY TAB */}
          {activeTimeframe === 'monthly' && monthlyData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>30-DAY WATER MANAGED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                    {monthlyData.monthly_metrics.total_water_managed_liters.toLocaleString()} L
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>30-DAY FRESHWATER PRESERVED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                    {monthlyData.monthly_metrics.freshwater_preserved_liters.toLocaleString()} L
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{monthlyData.monthly_metrics.overall_greywater_utilization_pct}% average greywater</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>MONTHLY SAVINGS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.25rem' }}>
                    ₹{monthlyData.monthly_metrics.total_cost_savings_inr.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>${monthlyData.monthly_metrics.total_cost_savings_usd} USD</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SYSTEM UPTIME</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                    {monthlyData.monthly_metrics.cooling_system_uptime_pct}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#00f2fe' }}>{monthlyData.monthly_metrics.average_cooling_efficiency_pct}% cooling efficiency</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', alignSelf: 'flex-start', marginBottom: '1rem' }}>
                    30-Day Risk Level Distribution
                  </h3>
                  <div style={{ height: '240px', width: '240px' }}>
                    <Doughnut data={monthlyRiskDoughnut} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    Sustainability & Operational Summary
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Through automated optimal blending ratios, the cooling towers operated safely across {monthlyData.risk_distribution.low_risk_days_pct}% low-risk days. 
                    A total of <strong>{monthlyData.monthly_metrics.freshwater_preserved_liters.toLocaleString()} Liters</strong> of freshwater were saved over 30 days, yielding <strong>₹{monthlyData.monthly_metrics.total_cost_savings_inr.toLocaleString()}</strong> in utility cost savings while achieving a <strong>100% scaling incident mitigation rate</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
