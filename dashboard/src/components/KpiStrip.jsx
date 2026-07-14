import React from 'react';

export default function KpiStrip({ seq, isLive }) {
  const statusColor =
    seq.clase === 0
      ? 'var(--accent-green)'
      : seq.clase === 1
      ? 'var(--accent-red)'
      : 'var(--accent-amber)';

  return (
    <div className="kpi-strip">
      <div className="kpi-card">
        <div className="kpi-label">Fuente Activa</div>
        <div className="kpi-value">
          {isLive
            ? (seq.id === 'WEBCAM' ? '📹 CAM' : '🎬 MP4')
            : `#${seq.id}`}
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Ejercicio Detectado</div>
        <div className="kpi-value" style={{ color: 'var(--accent-blue)', fontSize: '1.3rem' }}>
          {seq.action?.split('(')[0]?.trim() || 'GENERAL'}
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Estado Postural</div>
        <div className="kpi-value" style={{ color: statusColor, fontSize: '1.2rem' }}>
          {seq.nombre?.toUpperCase()}
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Calidad</div>
        <div className="kpi-value">
          {seq.qualityScore !== undefined && seq.qualityScore > 0
            ? `${seq.qualityScore.toFixed(0)}%`
            : `${(seq.confianza * 100).toFixed(1)}%`
          }
        </div>
      </div>
      {isLive && (
        <div className="kpi-card kpi-reps">
          <div className="kpi-label">Repeticiones</div>
          <div className="kpi-value" style={{ color: 'var(--accent-purple, #a855f7)' }}>
            {seq.repCount || 0}
          </div>
        </div>
      )}
    </div>
  );
}
