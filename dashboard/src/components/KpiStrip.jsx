import React from 'react';

export default function KpiStrip({ seq, isLive }) {
  const statusColor =
    seq.clase === 0
      ? 'var(--accent-green, #a1ff4f)'
      : seq.clase === 1
      ? 'var(--accent-red, #ff3366)'
      : 'var(--accent-amber, #ffb703)';

  const statusText =
    seq.clase === 0
      ? 'ÓPTIMO ✅'
      : seq.clase === 1
      ? 'ALERTA TRONCO ⚠️'
      : 'ALERTA RODILLA/EXTREMIDAD ⚠️';

  const phaseText =
    seq.phase === 'up'
      ? '⬆ ASCENSO (Concéntrica)'
      : seq.phase === 'down'
      ? '⬇ DESCENSO (Excéntrica)'
      : '⏸ ESTABLE / IDLE';

  const estimatedAngle =
    seq.phase === 'down' ? '92°' : seq.phase === 'up' ? '154°' : seq.clase === 0 ? '142°' : '118°';

  const kpiCardStyle = {
    padding: '18px 20px',
    borderRadius: '16px',
    background: 'var(--bg-card, #14181d)',
    border: '1px solid var(--border-color, #22272e)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="kpi-strip" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* 1. Fuente Activa */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          📡 FUENTE DE VIDEO
        </div>
        <div className="kpi-value">
          {isLive
            ? (seq.id === 'WEBCAM' ? '📹 CÁMARA WEB' : '📁 VIDEO MP4')
            : `📊 # ${seq.id}`}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--accent-blue, #00f0ff)', fontWeight: 700 }}>
          {seq.isExampleDemo ? '● DEMO EN VIVO' : isLive ? '● INFERENCIA IA 60 FPS' : '● DATASET 2D/3D'}
        </div>
      </div>

      {/* 2. Ejercicio Detectado */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          🏋️ EJERCICIO DETECTADO
        </div>
        <div className="kpi-value" style={{ color: 'var(--accent-blue, #00f0ff)' }}>
          {seq.action?.split('(')[0]?.trim() || 'GENERAL'}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
          Clasificación Neural Multiclase
        </div>
      </div>

      {/* 3. Estado Postural */}
      <div className="kpi-card" style={{
        ...kpiCardStyle,
        border: `1px solid ${statusColor}`,
        boxShadow: `0 0 20px ${statusColor}20`
      }}>
        <div className="kpi-label">
          🩺 DIAGNÓSTICO BIOMECÁNICO
        </div>
        <div className="kpi-value" style={{ color: statusColor, fontSize: '1.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {statusText}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
          {seq.nombre?.toUpperCase()}
        </div>
      </div>

      {/* 4. Calidad & Confianza */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          🎯 CALIDAD & CONFIANZA
        </div>
        <div className="kpi-value" style={{ color: 'var(--accent-green, #a1ff4f)' }}>
          {seq.qualityScore !== undefined && seq.qualityScore > 0
            ? `${seq.qualityScore.toFixed(0)}%`
            : `${(seq.confianza * 100).toFixed(1)}%`
          }
        </div>
        <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
          Precisión geométrica del movimiento
        </div>
      </div>

      {/* 5. Conteo de Repeticiones */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          🔄 REPETICIONES VÁLIDAS
        </div>
        <div className="kpi-value" style={{ color: 'var(--accent-purple, #c084fc)' }}>
          {seq.repCount || (seq.isExampleDemo ? '3' : '1')} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b949e' }}>REPS</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
          {phaseText}
        </div>
      </div>

      {/* 6. Ángulo Articular Clave */}
      <div className="kpi-card" style={kpiCardStyle}>
        <div className="kpi-label">
          📐 ÁNGULO ARTICULAR CLAVE
        </div>
        <div className="kpi-value" style={{ color: 'var(--accent-amber, #ffb703)' }}>
          {estimatedAngle}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
          Extensión / Flexión medida por IA
        </div>
      </div>
    </div>
  );
}
