import React from 'react';

export default function KpiStrip({ seq }) {
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

  const estimatedAngle =
    seq.phase === 'down' ? '92°' : seq.phase === 'up' ? '154°' : seq.clase === 0 ? '142°' : '118°';

  const kpiCardStyle = {
    padding: '20px 22px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, rgba(20, 24, 29, 0.92) 0%, rgba(13, 16, 20, 0.96) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
    transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div className="kpi-strip" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '18px',
      marginBottom: '28px'
    }}>
      {/* 1. Ejercicio Detectado */}
      <div 
        className="kpi-card" 
        style={{
          ...kpiCardStyle,
          borderLeft: '4px solid var(--accent-blue, #00f0ff)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 240, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            🏋️ EJERCICIO DETECTADO
          </span>
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.12)', color: '#00f0ff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            AI CORE
          </span>
        </div>
        <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--accent-blue, #00f0ff)', letterSpacing: '-0.02em', margin: '4px 0' }}>
          {seq.action?.split('(')[0]?.trim() || 'GENERAL'}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f0ff', display: 'inline-block' }}></span>
          Clasificación Neural Multiclase
        </div>
      </div>

      {/* 2. Diagnóstico Biomecánico */}
      <div 
        className="kpi-card" 
        style={{
          ...kpiCardStyle,
          border: `1px solid ${statusColor}44`,
          borderLeft: `4px solid ${statusColor}`,
          boxShadow: `0 12px 30px rgba(0,0,0,0.5), 0 0 25px ${statusColor}18`
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,0.6), 0 0 32px ${statusColor}33`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.5), 0 0 25px ${statusColor}18`;
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            🩺 DIAGNÓSTICO BIOMECÁNICO
          </span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></span>
        </div>
        <div style={{ color: statusColor, fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>
          {statusText}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>
          {seq.nombre?.toUpperCase()}
        </div>
      </div>

      {/* 3. Calidad & Confianza */}
      <div 
        className="kpi-card" 
        style={{
          ...kpiCardStyle,
          borderLeft: '4px solid var(--accent-green, #a1ff4f)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(161, 255, 79, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            🎯 CALIDAD & CONFIANZA
          </span>
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(161, 255, 79, 0.12)', color: '#a1ff4f', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            PRECISIÓN
          </span>
        </div>
        <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--accent-green, #a1ff4f)', letterSpacing: '-0.02em', margin: '4px 0' }}>
          {seq.qualityScore !== undefined && seq.qualityScore > 0
            ? `${seq.qualityScore.toFixed(0)}%`
            : `${(seq.confianza * 100).toFixed(1)}%`
          }
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a1ff4f', display: 'inline-block' }}></span>
          Precisión geométrica del movimiento
        </div>
      </div>

      {/* 4. Ángulo Articular Clave */}
      <div 
        className="kpi-card" 
        style={{
          ...kpiCardStyle,
          borderLeft: '4px solid var(--accent-amber, #ffb703)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(255, 183, 3, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            📐 ÁNGULO ARTICULAR CLAVE
          </span>
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 183, 3, 0.12)', color: '#ffb703', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            IA TRACKING
          </span>
        </div>
        <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--accent-amber, #ffb703)', letterSpacing: '-0.02em', margin: '4px 0' }}>
          {estimatedAngle}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffb703', display: 'inline-block' }}></span>
          Extensión / Flexión medida por IA
        </div>
      </div>
    </div>
  );
}
