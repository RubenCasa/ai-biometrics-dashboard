import React from 'react';

export default function Header({ onToggleSidebar, activeMenu }) {
  return (
    <header className="main-header" style={{
      justifyContent: 'space-between',
      padding: '16px 36px',
      background: 'rgba(12, 16, 22, 0.90)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
    }}>
      {/* Sección Izquierda: Botón Menú Lateral + Identidad del Proyecto */}
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>


        <div className="brand-icon" style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 900,
          boxShadow: '0 0 24px rgba(0, 240, 255, 0.4)',
          flexShrink: 0
        }}>📊</div>

        <div className="brand-text">
          <h1 style={{
            fontFamily: 'var(--font-display, Inter, sans-serif)',
            fontSize: '1.38rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15
          }}>
            BIOMETRÍA IA · ANÁLISIS DE POSTURA
          </h1>
          <p style={{
            fontSize: '0.78rem',
            color: '#00f0ff',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '3px 0 0 0',
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🎓</span> ESTUDIANTES DE CIENCIAS DE DATOS E INTELIGENCIA ARTIFICIAL
          </p>
        </div>
      </div>

    </header>
  );
}
