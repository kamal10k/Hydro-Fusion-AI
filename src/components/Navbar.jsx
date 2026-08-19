import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, User, Cpu, ShieldAlert, LogOut } from 'lucide-react';

export const Navbar = ({ activeTab, systemStatus = 'Normal Operation', activeAlertsCount = 1 }) => {
  const { user, logout } = useContext(AuthContext);

  const getTabTitle = (tab) => {
    const titles = {
      dashboard: 'Executive Dashboard & Real-Time Telemetry',
      predict: 'Cooling Water Scaling Risk Analyzer',
      'what-if': 'What-If Operational Parameter Laboratory',
      chat: 'Digital Chemist AI Assistant (Gemini API)',
      history: 'Historical Telemetry & Prediction Audit Logs',
      alerts: 'Scaling Risk Alerts & Preventive Maintenance',
      reports: 'Executive Water Management Report Generator',
      'agentic-ai': 'Agentic AI Orchestrator & n8n Multi-Agent Trace'
    };
    return titles[tab] || 'HydroFusion AI';
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(7, 10, 18, 0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          {getTabTitle(activeTab)}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          AI Data Center Cooling & Water Quality Optimization
        </p>
      </div>

      {/* Action Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          background: systemStatus === 'Attention Required' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${systemStatus === 'Attention Required' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
        }}>
          {systemStatus === 'Attention Required' ? (
            <ShieldAlert size={16} color="#f43f5e" className="pulse-active" />
          ) : (
            <Cpu size={16} color="#10b981" />
          )}
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: systemStatus === 'Attention Required' ? '#f43f5e' : '#10b981'
          }}>
            {systemStatus}
          </span>
        </div>

        {/* User Profile & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} color="#00f2fe" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: '#fca5a5'
              }}
            >
              <LogOut size={14} color="#f43f5e" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
