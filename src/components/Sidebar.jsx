import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Clock,
  SlidersHorizontal, 
  BarChart3,
  Bot, 
  History, 
  AlertTriangle, 
  FileText, 
  Workflow,
  Droplets,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Scaling Risk Analysis', icon: Activity },
    { id: 'forecast', label: '24h Risk Forecast', icon: Clock, badge: 'Predictive' },
    { id: 'what-if', label: 'What-If Laboratory', icon: SlidersHorizontal },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, badge: 'Metrics' },
    { id: 'chat', label: 'Digital Chemist AI', icon: Bot, badge: 'Gemini AI' },
    { id: 'history', label: 'Prediction Logs', icon: History },
    { id: 'alerts', label: 'Scaling Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Water Reports', icon: FileText },
    { id: 'agentic-ai', label: 'Agent Workflows', icon: Workflow, badge: 'n8n' }
  ];

  return (
    <aside style={{
      width: '260px',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      background: 'rgba(7, 10, 18, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      padding: '1.5rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.5rem 0.5rem 1.5rem 0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
        }}>
          <Droplets size={24} color="#070a12" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
            HydroFusion <span style={{ color: '#00f2fe' }}>AI</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            The Digital Chemist
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.05) 100%)' 
                  : 'transparent',
                color: isActive ? '#00f2fe' : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid #00f2fe' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={17} color={isActive ? '#00f2fe' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.4rem',
                  borderRadius: '6px',
                  background: item.badge === 'Gemini AI' ? 'rgba(139, 92, 246, 0.2)' : item.badge === 'Predictive' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: item.badge === 'Gemini AI' ? '#a78bfa' : item.badge === 'Predictive' ? '#00f2fe' : '#10b981',
                  border: `1px solid ${item.badge === 'Gemini AI' ? 'rgba(139, 92, 246, 0.4)' : item.badge === 'Predictive' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="glass-panel" style={{ padding: '0.85rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <ShieldCheck size={15} color="#10b981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>ML & Agentic AI Suite</span>
        </div>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
          4-Tier Risk • XAI Attribution • 24h Forecasting
        </p>
      </div>
    </aside>
  );
};
