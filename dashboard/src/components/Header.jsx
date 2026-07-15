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
        {activeMenu === 'live' && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel de control lateral"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#00f0ff',
              borderRadius: '12px',
              padding: '9px 15px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 800,
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ☰
          </button>
        )}

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

      {/* Sección Derecha: Flecha / Badge "Cambiando al Ecuador mira" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="ecuador-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(0, 240, 255, 0.14) 100%)',
          border: '1px solid #10b981',
          padding: '10px 22px',
          borderRadius: '9999px',
          boxShadow: '0 0 26px rgba(16, 185, 129, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          cursor: 'default'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 0 26px rgba(16, 185, 129, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)';
        }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981',
            display: 'inline-block',
            animation: 'pulseEcuador 1.5s infinite ease-in-out'
          }} />
          <span style={{
            fontSize: '0.88rem',
            color: '#ffffff',
            fontWeight: 900,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🇪🇨 CAMBIANDO AL ECUADOR <span style={{ color: '#00f0ff', fontSize: '1.1rem', transition: 'transform 0.2s ease' }}>➔</span> MIRA
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulseEcuador {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </header>
  );
}
