import React from 'react';

export default function Hero({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0a0d14',
      color: '#ffffff',
      textAlign: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'rgba(161, 255, 79, 0.1)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />

      {/* Floating Elements (simulating the 3D assets from the image) */}
      <div className="floating-item" style={{ position: 'absolute', top: '25%', left: '15%', fontSize: '4rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))', zIndex: 1, animation: 'float 6s ease-in-out infinite' }}>🏋️</div>
      <div className="floating-item" style={{ position: 'absolute', top: '60%', left: '10%', fontSize: '3rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))', zIndex: 1, animation: 'float 5s ease-in-out infinite 1s' }}>⚡</div>
      <div className="floating-item" style={{ position: 'absolute', top: '20%', right: '15%', fontSize: '4.5rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))', zIndex: 1, animation: 'float 7s ease-in-out infinite 0.5s' }}>🦾</div>
      <div className="floating-item" style={{ position: 'absolute', top: '65%', right: '12%', fontSize: '3.5rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))', zIndex: 1, animation: 'float 5.5s ease-in-out infinite 2s' }}>🎯</div>

      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(4rem, 10vw, 9rem)',
          fontWeight: 900,
          fontFamily: '"Impact", "Arial Black", sans-serif',
          textTransform: 'uppercase',
          lineHeight: 0.85,
          letterSpacing: '-0.04em',
          margin: '0 0 20px 0',
          color: '#ffffff',
          textShadow: '0 10px 30px rgba(0,0,0,0.8)'
        }}>
          <span style={{ display: 'block' }}>ÚNETE A LA</span>
          <span style={{ display: 'block' }}>NUEVA ERA DE LA</span>
          <span style={{ display: 'block', background: 'linear-gradient(135deg, #00f0ff 0%, #7dd3fc 50%, #ffffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 4px 30px rgba(0, 240, 255, 0.6))' }}>BIOMECÁNICA</span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          color: '#9ca3af',
          maxWidth: '600px',
          lineHeight: 1.5,
          marginBottom: '50px',
          fontWeight: 500,
          fontFamily: 'var(--font-main, sans-serif)'
        }}>
          Corrección postural en tiempo real impulsada por Inteligencia Artificial.
        </p>
        
        <button 
          onClick={onStart}
          style={{
            background: 'var(--accent-green, #a1ff4f)',
            color: '#000',
            fontSize: '1.2rem',
            fontWeight: 900,
            padding: '20px 50px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 10px 30px rgba(161, 255, 79, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            fontFamily: 'var(--font-display, sans-serif)',
            marginBottom: '40px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(161, 255, 79, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(161, 255, 79, 0.3)';
          }}
        >
          INICIAR DASHBOARD
        </button>

        {/* Textos y Branding integrados al Hero */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
          maxWidth: '900px'
        }}>
          {/* Badges / Pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(0, 240, 255, 0.08)', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              📊 BIOMETRÍA IA · ANÁLISIS DE POSTURA
            </span>
            <span style={{ fontSize: '0.75rem', color: '#a1ff4f', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(161, 255, 79, 0.08)', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(161, 255, 79, 0.2)' }}>
              🎓 ESTUDIANTES DE CIENCIAS DE DATOS E INTELIGENCIA ARTIFICIAL
            </span>
          </div>


        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
