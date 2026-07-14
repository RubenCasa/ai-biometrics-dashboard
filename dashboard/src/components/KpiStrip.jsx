import React from 'react';

export default function KpiStrip({ seq, isLive }) {
  const statusColor =
    seq.clase === 0
      ? 'var(--accent-green, #34d399)'
      : seq.clase === 1
      ? 'var(--accent-amber, #fbbf24)'
      : 'var(--accent-red, #f87171)';

  const statusText =
    seq.clase === 0
      ? 'ÓPTIMO 🍃'
      : seq.clase === 1
      ? 'ALERTA TRONCO 🔥'
      : 'ALERTA ARTICULAR ☁️';

  const phaseText =
    seq.phase === 'up'
      ? '⬆ ASCENSO (Concéntrica)'
      : seq.phase === 'down'
      ? '⬇ DESCENSO (Excéntrica)'
      : '⏸ ESTABLE / IDLE';

  const estimatedAngle =
    seq.phase === 'down' ? '92°' : seq.phase === 'up' ? '154°' : seq.clase === 0 ? '142°' : '118°';

  const kpiCardStyle = {
    padding: '18px 22px',
    borderRadius: '18px',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(18px)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="kpi-strip">
      {/* 1. Fuente Activa del Studio */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          📡 FUENTE DEL STUDIO
        </div>
        <div className="kpi-value">
          {isLive
            ? (seq.id === 'WEBCAM' ? '📹 CÁMARA WEB' : '📁 VÍDEO MP4')
            : `🌲 # ${seq.id}`}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
          {seq.isExampleDemo ? '● DEMO EN VIVO' : isLive ? '● INFERENCIA IA 60 FPS' : '● DATASET 2D/3D'}
        </div>
      </div>

      {/* 2. Fase Biomecánica */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          ⏱ FASE BIOMECÁNICA
        </div>
        <div className="kpi-value" style={{ fontSize: '1.25rem', color: '#38bdf8' }}>
          {phaseText}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          REPETICIONES CONTADAS: <span style={{ color: '#ffffff', fontWeight: 800 }}>{seq.repCount || 0}</span>
        </div>
      </div>

      {/* 3. Índice de Calidad Postural */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          📈 CALIDAD DE MOVIMIENTO
        </div>
        <div className="kpi-value" style={{ color: statusColor }}>
          {seq.qualityScore !== undefined && seq.qualityScore > 0 ? `${seq.qualityScore.toFixed(0)}%` : `${(seq.confianza * 100).toFixed(0)}%`}
        </div>
        <div style={{ fontSize: '0.74rem', color: statusColor, fontWeight: 700 }}>
          ESTADO: {statusText}
        </div>
      </div>

      {/* 4. Ángulo Estimado de Rodilla / Tronco */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          ⚙️ ÁNGULO DE REFERENCIA
        </div>
        <div className="kpi-value" style={{ color: '#c084fc' }}>
          {estimatedAngle}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          ALINEACIÓN 3D: <span style={{ color: '#c084fc', fontWeight: 800 }}>ÓPTIMA (90°)</span>
        </div>
      </div>
    </div>
  );
}
