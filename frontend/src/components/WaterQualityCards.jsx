import React from 'react';
import { Waves, TestTube, Zap, Thermometer } from 'lucide-react';

export const WaterQualityCards = ({ tds = 750, ph = 8.1, conductivity = 950, waterTemp = 31 }) => {
  const cards = [
    {
      title: 'TDS (Total Dissolved Solids)',
      value: `${tds} ppm`,
      icon: Waves,
      color: tds > 700 ? '#f43f5e' : tds > 500 ? '#f59e0b' : '#10b981',
      status: tds > 700 ? 'High Mineral Content' : tds > 500 ? 'Moderate' : 'Optimal',
      sub: 'Dissolved mineral solids'
    },
    {
      title: 'pH Level',
      value: `${ph}`,
      icon: TestTube,
      color: ph > 8.0 ? '#f43f5e' : ph < 6.8 ? '#f59e0b' : '#10b981',
      status: ph > 8.0 ? 'Alkaline (Precipitation Risk)' : 'Balanced',
      sub: 'Water acidity / alkalinity'
    },
    {
      title: 'Conductivity',
      value: `${conductivity} µS/cm`,
      icon: Zap,
      color: conductivity > 900 ? '#f43f5e' : '#00f2fe',
      status: conductivity > 900 ? 'Elevated Ionic Load' : 'Normal',
      sub: 'Ionic charge conduction'
    },
    {
      title: 'Cooling Water Temp',
      value: `${waterTemp} °C`,
      icon: Thermometer,
      color: waterTemp > 30 ? '#f59e0b' : '#10b981',
      status: waterTemp > 30 ? 'Thermal Elevation' : 'Normal',
      sub: 'Heat exchange loop temp'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="glass-panel glass-card-interactive" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.title}</span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${c.color}20`,
                border: `1px solid ${c.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={16} color={c.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {c.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{c.sub}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: c.color, padding: '0.1rem 0.4rem', borderRadius: '4px', background: `${c.color}15` }}>
                {c.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
