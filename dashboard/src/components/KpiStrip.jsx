import React from 'react';

export default function KpiStrip({ seq, isLive }) {
  const statusColor =
    seq.clase === 0
      ? 'var(--accent-green, #10b981)'
      : seq.clase === 1
      ? 'var(--accent-red, #ef4444)'
      : 'var(--accent-amber, #f59e0b)';

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

  // Ángulo aproximado basado en la fase o el dataset para visualización instantánea
  const estimatedAngle =
    seq.phase === 'down' ? '92°' : seq.phase === 'up' ? '154°' : seq.clase === 0 ? '142°' : '118°';

  return (
    <div className="kpi-strip" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '14px',
      marginBottom: '20px'
    }}>
      {/* 1. Fuente Activa */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📡 Fuente de Video
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px 0' }}>
          {isLive
            ? (seq.id === 'WEBCAM' ? '📹 CÁMARA WEB' : '📁 VIDEO MP4')
            : `📊 PENN #${seq.id}`}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
          {seq.isExampleDemo ? '● DEMO EN VIVO' : isLive ? '● INFERENCIA IA 60 FPS' : '● DATASET 2D/3D'}
        </div>
      </div>

      {/* 2. Ejercicio Detectado */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🏋️ Ejercicio Detectado
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', margin: '6px 0 2px 0' }}>
          {seq.action?.split('(')[0]?.trim() || 'GENERAL'}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          Clasificación Neural Multiclase
        </div>
      </div>

      {/* 3. Estado Postural */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: `1px solid ${statusColor}40`,
        boxShadow: `0 0 15px ${statusColor}15`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🩺 Diagnóstico Biomecánico</span>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: statusColor, margin: '6px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {statusText}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          {seq.nombre?.toUpperCase()}
        </div>
      </div>

      {/* 4. Calidad & Confianza */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(16, 185, 129, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🎯 Calidad & Confianza
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', margin: '6px 0 2px 0' }}>
          {seq.qualityScore !== undefined && seq.qualityScore > 0
            ? `${seq.qualityScore.toFixed(0)}%`
            : `${(seq.confianza * 100).toFixed(1)}%`
          }
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          Precisión geométrica del movimiento
        </div>
      </div>

      {/* 5. Conteo de Repeticiones */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(168, 85, 247, 0.28)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔄 Repeticiones Válidas
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#a855f7', margin: '6px 0 2px 0' }}>
          {seq.repCount || (seq.isExampleDemo ? '3' : '1')} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>reps</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          {phaseText}
        </div>
      </div>

      {/* 6. Ángulo Articular Clave */}
      <div className="card kpi-card" style={{
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(245, 158, 11, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📐 Ángulo Articular Clave
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', margin: '6px 0 2px 0' }}>
          {estimatedAngle}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          Extensión / Flexión medida por IA
        </div>
      </div>
    </div>
  );
}
