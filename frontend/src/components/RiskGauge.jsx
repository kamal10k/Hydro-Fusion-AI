import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const RiskGauge = ({ riskLabel = 'LOW', probability = 18.2 }) => {
  const isHigh = riskLabel === 'HIGH';
  const strokeColor = isHigh ? '#f43f5e' : '#10b981';
  const glowColor = isHigh ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)';
  
  // Calculate arc stroke offset for semi-circle gauge (radius 70, circumference ~220)
  const radius = 70;
  const circumference = Math.PI * radius;
  const progress = Math.min(Math.max(probability, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-panel" style={{
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: glowColor,
        filter: 'blur(50px)',
        top: '20%',
        zIndex: 0
      }} />

      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', zIndex: 1 }}>
        Scaling Risk Prediction
      </h3>

      {/* SVG Arc Gauge */}
      <div style={{ position: 'relative', width: '200px', height: '120px', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <svg width="200" height="120" viewBox="0 0 200 120" style={{ transform: 'rotate(0deg)' }}>
          {/* Background Arc */}
          <path
            d="M 20 100 A 70 70 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Active Progress Arc */}
          <path
            d="M 20 100 A 70 70 0 0 1 180 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
            {probability}%
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Risk Probability
          </span>
        </div>
      </div>

      {/* Risk Badge & Icon */}
      <div style={{
        marginTop: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 1
      }}>
        {isHigh ? (
          <div className="badge badge-high-risk pulse-active">
            <AlertCircle size={14} />
            <span>HIGH RISK ({probability}%)</span>
          </div>
        ) : (
          <div className="badge badge-low-risk">
            <CheckCircle2 size={14} />
            <span>LOW RISK ({probability}%)</span>
          </div>
        )}
      </div>
    </div>
  );
};
