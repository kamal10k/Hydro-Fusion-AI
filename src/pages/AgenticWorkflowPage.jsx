import React, { useState } from 'react';
import { api } from '../services/api';
import { Workflow, Bot, AlertTriangle, ShieldCheck, Zap, Send, CheckCircle2 } from 'lucide-react';

export const AgenticWorkflowPage = () => {
  const [n8nResponse, setN8nResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  const agents = [
    { name: '1. Water Monitoring Agent', role: 'Telemetry Validation', status: 'ACTIVE', desc: 'Audits incoming GPU and water parameters for valid ranges and non-negative constraints.' },
    { name: '2. Scaling Risk Agent', role: 'Random Forest Classifier', status: 'ACTIVE', desc: 'Evaluates thermodynamic scaling probability % using Scikit-Learn binary model.' },
    { name: '3. Optimization Agent', role: 'Water Blending Engine', status: 'ACTIVE', desc: 'Calculates optimal Freshwater vs. Greywater ratio to minimize municipal water usage.' },
    { name: '4. Decision Agent', role: 'Action Pathway Resolver', status: 'ACTIVE', desc: 'Triggers maintenance escalation if Scaling Risk > 50%.' },
    { name: '5. Maintenance Agent', role: 'Work Order Generator', status: 'ACTIVE', desc: 'Generates specific preventive maintenance inspection tasks for plant engineers.' },
    { name: '6. Alert Agent', role: 'n8n Webhook Dispatcher', status: 'INTEGRATED', desc: 'Dispatches multi-channel webhooks (Email/Telegram/Slack simulation) via n8n.' }
  ];

  const handleTestN8n = async () => {
    setTesting(true);
    try {
      const res = await api.triggerN8nTest({
        event: 'TEST_AGENTIC_ALERT',
        risk_level: 'HIGH',
        ratio: '80% Fresh / 20% Grey'
      });
      setN8nResponse(res);
      setTesting(false);
    } catch (err) {
      setTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Workflow size={24} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Agentic AI Workflow & n8n Orchestration System
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Autonomous 6-agent cascade triggering n8n webhook notifications on High Risk events.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={handleTestN8n} disabled={testing}>
          <Send size={16} /> Test n8n Webhook Trigger
        </button>
      </div>

      {/* 6-Agent Flow Graphic */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {agents.map((ag, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{ag.name}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {ag.status}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 600, marginBottom: '0.4rem' }}>
              {ag.role}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {ag.desc}
            </p>
          </div>
        ))}
      </div>

      {/* n8n Status Log Result */}
      {n8nResponse && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
            <CheckCircle2 size={18} /> n8n Integration Webhook Executed Successfully:
          </div>
          <pre style={{ background: 'rgba(7, 10, 18, 0.7)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#00f2fe', overflowX: 'auto' }}>
            {JSON.stringify(n8nResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
