import React from 'react';

export default function Hero({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at 50% 50%, #111a2e 0%, #0a0d14 100%)',
      color: '#ffffff',
      textAlign: 'center',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 240, 255, 0.1)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(161, 255, 79, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{ zIndex: 1 }}>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #00f0ff 0%, #a1ff4f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px',
          fontFamily: 'var(--font-display, sans-serif)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1
        }}>
          BIOMETRÍA IA PRO
        </div>
        <p style={{
          fontSize: '1.25rem',
          color: '#cbd5e1',
          maxWidth: '650px',
          lineHeight: 1.6,
          marginBottom: '50px',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontWeight: 400
        }}>
          Sube tus videos, analiza tu técnica y perfecciona tu postura con nuestro motor de Inteligencia Artificial en tiempo real basado en 33 puntos de referencia.
        </p>
        <button 
          onClick={onStart}
          style={{
            background: 'var(--accent-green, #a1ff4f)',
            color: '#000',
            fontSize: '1.15rem',
            fontWeight: 900,
            padding: '18px 48px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 8px 32px rgba(161, 255, 79, 0.35)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(161, 255, 79, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(161, 255, 79, 0.35)';
          }}
        >
          ENTRAR AL DASHBOARD ➔
        </button>
      </div>
    </div>
  );
}
