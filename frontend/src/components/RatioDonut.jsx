import React from 'react';
import { Droplet, Recycle } from 'lucide-react';

export const RatioDonut = ({ freshRatio = 80, greyRatio = 20, dailyUsage = 5200 }) => {
  const freshLiters = Math.round((freshRatio / 100) * dailyUsage);
  const greyLiters = Math.round((greyRatio / 100) * dailyUsage);

  // SVG Donut calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const freshOffset = circumference - (freshRatio / 100) * circumference;

  return (
    <div className="glass-panel" style={{
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
        Recommended Blending Ratio
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background Greywater Segment */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="18"
            />
            {/* Foreground Freshwater Segment */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#00f2fe"
              strokeWidth="18"
              strokeDasharray={circumference}
              strokeDashoffset={freshOffset}
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>

          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'block' }}>
              {freshRatio}:{greyRatio}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Fresh : Grey
            </span>
          </div>
        </div>

        {/* Legend & Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', minWidth: '160px' }}>
          {/* Freshwater Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplet size={16} color="#00f2fe" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Freshwater: {freshRatio}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {freshLiters.toLocaleString()} L/day
              </div>
            </div>
          </div>

          {/* Greywater Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Recycle size={16} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Greywater: {greyRatio}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                {greyLiters.toLocaleString()} L/day saved
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1.25rem',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        textAlign: 'center',
        fontStyle: 'italic',
        maxWidth: '450px'
      }}>
        * Project recommendation. Validate against plant water treatment guidelines.
      </div>
    </div>
  );
};
