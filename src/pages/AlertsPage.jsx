import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  AlertTriangle, ShieldCheck, CheckCircle2, Bell, RefreshCw, 
  Settings, Sliders, Save, X, Mail
} from 'lucide-react';

export const AlertsPage = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([
    {
      alert_id: 1,
      prediction_id: 1,
      alert_type: 'CRITICAL_SCALING',
      severity: 'CRITICAL',
      message: 'CRITICAL SCALING RISK (87.5%). Immediate blending adjustment to 80% Freshwater / 20% Greywater enforced due to elevated TDS (750 ppm) and GPU Temp (85°C).',
      status: 'Active',
      created_at: '2026-08-19 08:30:00'
    },
    {
      alert_id: 2,
      prediction_id: 3,
      alert_type: 'EXTREME_SCALING',
      severity: 'CRITICAL',
      message: 'Extreme Scaling Warning (94.1%). High cooling cycles (18) and alkaline pH (8.4). Shift to 90% Freshwater recommended.',
      status: 'Active',
      created_at: '2026-08-19 02:15:00'
    }
  ]);

  const [thresholds, setThresholds] = useState({
    tds_max_limit: 800.0,
    ph_min_limit: 6.8,
    ph_max_limit: 8.2,
    conductivity_max_limit: 1000.0,
    risk_probability_threshold: 60.0,
    rapid_increase_rate_threshold: 20.0,
    email_alerts_enabled: 1
  });

  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);

  useEffect(() => {
    fetchAlerts();
    fetchThresholds();
  }, []);

  const fetchAlerts = () => {
    api.getAlerts()
      .then(res => {
        if (res && res.alerts) setAlerts(res.alerts);
      })
      .catch(() => {});
  };

  const fetchThresholds = () => {
    api.getThresholds()
      .then(data => {
        if (data) setThresholds(data);
      })
      .catch(() => {});
  };

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setSavingThresholds(true);
    try {
      await api.updateThresholds(thresholds);
      setShowThresholdModal(false);
    } catch (err) {
      console.error('Failed to update thresholds:', err);
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.dismissAlert(id);
      setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, status: 'Resolved' } : a));
    } catch (err) {}
  };

  const getSeverityStyle = (sev = 'HIGH') => {
    if (sev === 'CRITICAL') return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' };
    if (sev === 'HIGH') return { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', border: 'rgba(251, 113, 133, 0.4)' };
    if (sev === 'WARNING') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
    return { color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.15)', border: 'rgba(0, 242, 254, 0.4)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={24} color="#f43f5e" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Scaling Risk Alerts & Automated Incident Management
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time multi-channel notifications dispatched via Agentic AI & n8n webhooks based on configurable system thresholds.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => setShowThresholdModal(true)}>
            <Settings size={14} /> Alert Thresholds
          </button>
          <button className="btn-secondary" onClick={fetchAlerts}>
            <RefreshCw size={14} /> Refresh Alerts
          </button>
        </div>
      </div>

      {/* Threshold Modal */}
      {showThresholdModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 10, 18, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="#00f2fe" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Configure System Thresholds</h3>
              </div>
              <button onClick={() => setShowThresholdModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Maximum TDS Limit (ppm)
                </label>
                <input
                  type="number"
                  value={thresholds.tds_max_limit}
                  onChange={(e) => setThresholds({ ...thresholds, tds_max_limit: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Min Safe pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_min_limit}
                    onChange={(e) => setThresholds({ ...thresholds, ph_min_limit: parseFloat(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Max Safe pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_max_limit}
                    onChange={(e) => setThresholds({ ...thresholds, ph_max_limit: parseFloat(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Conductivity Limit (µS/cm)
                </label>
                <input
                  type="number"
                  value={thresholds.conductivity_max_limit}
                  onChange={(e) => setThresholds({ ...thresholds, conductivity_max_limit: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Scaling Risk Probability Trigger (%)
                </label>
                <input
                  type="number"
                  value={thresholds.risk_probability_threshold}
                  onChange={(e) => setThresholds({ ...thresholds, risk_probability_threshold: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="email_alerts"
                  checked={thresholds.email_alerts_enabled === 1}
                  onChange={(e) => setThresholds({ ...thresholds, email_alerts_enabled: e.target.checked ? 1 : 0 })}
                  style={{ width: '16px', height: '16px', accentColor: '#00f2fe' }}
                />
                <label htmlFor="email_alerts" style={{ fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer' }}>
                  Dispatch automated Email Alerts upon critical threshold breaches
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowThresholdModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingThresholds} className="btn-primary">
                  <Save size={16} /> Save Threshold Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((alert) => {
          const isActive = alert.status === 'Active';
          const sevStyle = getSeverityStyle(alert.severity || 'HIGH');
          return (
            <div
              key={alert.alert_id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderLeft: `4px solid ${isActive ? sevStyle.color : '#10b981'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isActive ? sevStyle.bg : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${isActive ? sevStyle.border : 'rgba(16, 185, 129, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isActive ? <AlertTriangle size={20} color={sevStyle.color} className="pulse-active" /> : <CheckCircle2 size={20} color="#10b981" />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                      {alert.alert_type}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: sevStyle.bg,
                      color: sevStyle.color,
                      border: `1px solid ${sevStyle.border}`
                    }}>
                      {alert.severity || 'HIGH'}
                    </span>
                    <span className={isActive ? 'badge badge-high-risk' : 'badge badge-low-risk'}>
                      {alert.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {alert.created_at}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {alert.message}
                  </p>
                </div>
              </div>

              {isActive && (
                <button
                  className="btn-secondary"
                  onClick={() => handleDismiss(alert.alert_id)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Mark Resolved
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
