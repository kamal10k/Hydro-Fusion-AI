import React from 'react';
import { Cpu, Gauge, Sun, Wind, RefreshCw, Clock } from 'lucide-react';

export const CoolingParamsCards = ({ gpuTemp = 85, gpuPower = 92, ambTemp = 37, humidity = 70, cycles = 15, towerAge = 5 }) => {
  const cards = [
    {
      title: 'GPU Temperature',
      value: `${gpuTemp} °C`,
      icon: Cpu,
      color: gpuTemp > 80 ? '#f43f5e' : '#10b981',
      status: gpuTemp > 80 ? 'Thermal Stress' : 'Normal',
      sub: 'AI Workload Thermal Flux'
    },
    {
      title: 'GPU Power Load',
      value: `${gpuPower} %`,
      icon: Gauge,
      color: gpuPower > 85 ? '#f59e0b' : '#00f2fe',
      status: gpuPower > 85 ? 'High Utilization' : 'Nominal',
      sub: 'Cluster Workload Load'
    },
    {
      title: 'Ambient & Humidity',
      value: `${ambTemp}°C / ${humidity}%`,
      icon: Sun,
      color: ambTemp > 35 ? '#f59e0b' : '#10b981',
      status: ambTemp > 35 ? 'Evaporative Heat Demand' : 'Standard',
      sub: 'Environmental Ambient'
    },
    {
      title: 'Cycles & Tower Age',
      value: `${cycles} cyc / ${towerAge} yr`,
      icon: RefreshCw,
      color: cycles > 12 ? '#f43f5e' : '#8b5cf6',
      status: cycles > 12 ? 'High Cycle Concentration' : 'Optimal',
      sub: 'Tower Lifecycle Dynamics'
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
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
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
