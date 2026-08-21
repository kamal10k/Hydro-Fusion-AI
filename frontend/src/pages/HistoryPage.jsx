import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Search, Download, Filter, Eye, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const HistoryPage = () => {
  const [history, setHistory] = useState([
    {
      prediction_id: 1,
      created_at: '2026-08-19 08:30:00',
      gpu_temperature: 85.0,
      gpu_power_load: 92.0,
      tds: 750.0,
      ph: 8.1,
      conductivity: 950.0,
      cooling_cycles: 15.0,
      scaling_prediction: 'HIGH',
      risk_probability: 87.5,
      freshwater_ratio: 80.0,
      greywater_ratio: 20.0
    },
    {
      prediction_id: 2,
      created_at: '2026-08-19 04:15:00',
      gpu_temperature: 72.0,
      gpu_power_load: 65.0,
      tds: 420.0,
      ph: 7.2,
      conductivity: 580.0,
      cooling_cycles: 6.0,
      scaling_prediction: 'LOW',
      risk_probability: 18.2,
      freshwater_ratio: 40.0,
      greywater_ratio: 60.0
    }
  ]);
  const [filterRisk, setFilterRisk] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [filterRisk]);

  const fetchHistory = () => {
    api.getHistory(filterRisk)
      .then(res => {
        if (res && res.history) setHistory(res.history);
      })
      .catch(() => {});
  };

  const filteredHistory = history.filter(item => {
    const term = search.toLowerCase();
    return (
      (item.scaling_prediction && item.scaling_prediction.toLowerCase().includes(term)) ||
      (item.user_name && item.user_name.toLowerCase().includes(term)) ||
      (item.user_role && item.user_role.toLowerCase().includes(term)) ||
      (item.facility_name && item.facility_name.toLowerCase().includes(term)) ||
      String(item.tds).includes(term) ||
      String(item.gpu_temperature).includes(term) ||
      String(item.created_at).includes(term)
    );
  });

  const exportCSV = () => {
    const headers = ['ID,Date,User_Name,User_Role,Facility,GPU_Temp,GPU_Power,TDS,pH,Conductivity,Cycles,Prediction,Risk_Prob_Pct,Freshwater_Pct,Greywater_Pct\n'];
    const rows = filteredHistory.map(h => 
      `${h.prediction_id},"${h.created_at}","${h.user_name || ''}","${h.user_role || ''}","${h.facility_name || ''}",${h.gpu_temperature},${h.gpu_power_load},${h.tds},${h.ph},${h.conductivity},${h.cooling_cycles},${h.scaling_prediction},${h.risk_probability},${h.freshwater_ratio},${h.greywater_ratio}`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrofusion_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by user, facility, role, date, or TDS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="input-field"
              style={{ width: '140px' }}
            >
              <option value="">All Risks</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="LOW">LOW Risk</option>
            </select>
          </div>
        </div>

        <button className="btn-secondary" onClick={exportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* History Table */}
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              <th style={{ padding: '0.85rem' }}>ID</th>
              <th style={{ padding: '0.85rem' }}>Timestamp</th>
              <th style={{ padding: '0.85rem' }}>User / Role</th>
              <th style={{ padding: '0.85rem' }}>Facility</th>
              <th style={{ padding: '0.85rem' }}>GPU Temp</th>
              <th style={{ padding: '0.85rem' }}>TDS (ppm)</th>
              <th style={{ padding: '0.85rem' }}>pH</th>
              <th style={{ padding: '0.85rem' }}>Risk Level</th>
              <th style={{ padding: '0.85rem' }}>Risk %</th>
              <th style={{ padding: '0.85rem' }}>Blending Ratio</th>
              <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((row) => {
              const isHigh = row.scaling_prediction === 'HIGH' || row.scaling_prediction === 'CRITICAL';
              return (
                <tr key={row.prediction_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>#{row.prediction_id}</td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{row.created_at}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.user_name || 'Dr. Alex Vance'}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.user_role || 'Operator'}</span>
                  </td>
                  <td style={{ padding: '0.85rem', color: '#00f2fe', fontWeight: 600 }}>{row.facility_name || 'Facility Alpha'}</td>
                  <td style={{ padding: '0.85rem', color: '#f8fafc' }}>{row.gpu_temperature}°C</td>
                  <td style={{ padding: '0.85rem', color: '#f8fafc' }}>{row.tds}</td>
                  <td style={{ padding: '0.85rem', color: '#f8fafc' }}>{row.ph}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={isHigh ? 'badge badge-high-risk' : 'badge badge-low-risk'}>
                      {row.scaling_prediction}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: 700, color: isHigh ? '#f43f5e' : '#10b981' }}>
                    {row.risk_probability}%
                  </td>
                  <td style={{ padding: '0.85rem', color: '#00f2fe', fontWeight: 600 }}>
                    {row.freshwater_ratio}% Fresh / {row.greywater_ratio}% Grey
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedDetail(row)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedDetail(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Prediction Audit Log #{selectedDetail.prediction_id}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>Operator Name: <strong style={{ color: '#f8fafc' }}>{selectedDetail.user_name || 'Dr. Alex Vance'}</strong></div>
              <div>User Role: <strong style={{ color: '#f8fafc' }}>{selectedDetail.user_role || 'Admin'}</strong></div>
              <div>User Email: <strong style={{ color: '#00f2fe' }}>{selectedDetail.user_email || 'alex.vance@hydrofusion.ai'}</strong></div>
              <div>Facility Context: <strong style={{ color: '#00f2fe' }}>{selectedDetail.facility_name || 'Facility Alpha'}</strong></div>
              <div>GPU Temp: <strong style={{ color: '#f8fafc' }}>{selectedDetail.gpu_temperature}°C</strong></div>
              <div>GPU Power: <strong style={{ color: '#f8fafc' }}>{selectedDetail.gpu_power_load}%</strong></div>
              <div>TDS: <strong style={{ color: '#f8fafc' }}>{selectedDetail.tds} ppm</strong></div>
              <div>pH: <strong style={{ color: '#f8fafc' }}>{selectedDetail.ph}</strong></div>
              <div>Conductivity: <strong style={{ color: '#f8fafc' }}>{selectedDetail.conductivity} µS/cm</strong></div>
              <div>Cooling Cycles: <strong style={{ color: '#f8fafc' }}>{selectedDetail.cooling_cycles}</strong></div>
              <div>Scaling Risk: <strong style={{ color: selectedDetail.scaling_prediction === 'HIGH' || selectedDetail.scaling_prediction === 'CRITICAL' ? '#f43f5e' : '#10b981' }}>{selectedDetail.scaling_prediction} ({selectedDetail.risk_probability}%)</strong></div>
              <div>Blending: <strong style={{ color: '#00f2fe' }}>{selectedDetail.freshwater_ratio}% Fresh / {selectedDetail.greywater_ratio}% Grey</strong></div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSelectedDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
