import React from 'react';
import { Sparkles, BrainCircuit, Info, TrendingUp } from 'lucide-react';

export const ExplainableAIWidget = ({ contributions = [] }) => {
  if (!contributions || contributions.length === 0) {
    contributions = [
      { feature: 'tds', name: 'Total Dissolved Solids', value: 750, unit: 'ppm', contribution_pct: 32.5, impact: 'HIGH_POSITIVE' },
      { feature: 'conductivity', name: 'Conductivity', value: 950, unit: 'µS/cm', contribution_pct: 24.8, impact: 'HIGH_POSITIVE' },
      { feature: 'cooling_cycles', name: 'Cooling Cycles', value: 15, unit: 'cycles', contribution_pct: 18.4, impact: 'MODERATE_POSITIVE' },
      { feature: 'gpu_temperature', name: 'GPU Core Temperature', value: 85, unit: '°C', contribution_pct: 12.6, impact: 'MODERATE_POSITIVE' },
      { feature: 'ph', name: 'pH Level', value: 8.1, unit: 'pH', contribution_pct: 7.2, impact: 'NOMINAL' },
      { feature: 'water_temperature', name: 'Cooling Water Temperature', value: 31, unit: '°C', contribution_pct: 4.5, impact: 'NOMINAL' }
    ];
  }

  const getImpactColor = (impact) => {
    if (impact === 'HIGH_POSITIVE') return '#f43f5e';
    if (impact === 'MODERATE_POSITIVE') return '#f59e0b';
    return '#00f2fe';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BrainCircuit size={18} color="#a78bfa" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Explainable AI (XAI) Feature Attribution
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>
              Mathematical Contribution Decomposition
            </span>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Info size={13} /> Relative Influence %
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {contributions.map((c, idx) => {
          const color = getImpactColor(c.impact);
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                  {c.name} <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({c.value} {c.unit})</span>
                </span>
                <span style={{ color: color, fontWeight: 700 }}>
                  +{c.contribution_pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(c.contribution_pct * 2.5, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)`,
                  borderRadius: '9999px',
                  transition: 'width 0.8s ease-in-out'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '0.25rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: 'rgba(7, 10, 18, 0.6)',
        border: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        💡 <strong>XAI Insight:</strong> {contributions[0]?.name} is the primary scaling catalyst driving {contributions[0]?.contribution_pct}% of total mineral saturation potential. Diluting TDS or reducing concentration cycles will yield the fastest risk mitigation.
      </div>
    </div>
  );
};
