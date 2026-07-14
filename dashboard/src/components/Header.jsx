import React, { useState } from 'react';

export default function Header({ onToggleSidebar, activeMenu, onSelectMenu }) {
  const [audioCoachActive, setAudioCoachActive] = useState(true);

  const menus = [
    { id: 'live', label: 'Estudio en Vivo', badge: 'IA 60FPS' },
    { id: 'demos', label: 'Galería Demos', badge: '5 Ejercicios' },
    { id: 'dataset', label: 'Dataset & Ciencia', badge: 'Penn Action' },
    { id: 'guide', label: 'Guía & Rutinas', badge: 'Principiantes' }
  ];

  const toggleAudioCoach = () => {
    const nextState = !audioCoachActive;
    setAudioCoachActive(nextState);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (nextState) {
        const u = new SpeechSynthesisUtterance("Coach biomecánico de voz activado en modo profesional. ¡Listo!");
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
    }
  };

  return (
    <header className="main-header">
      {/* Brand & Hamburger (INK Games Style) */}
      <div className="brand">
        {activeMenu === 'live' && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel de control lateral"
            style={{
              background: '#14181d',
              border: '1px solid #22272e',
              color: '#a1ff4f',
              borderRadius: '9999px',
              padding: '8px 16px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            ☰
          </button>
        )}
        <div className="brand-icon">⚡</div>
        <div className="brand-text">
          <h1>AI BIOMETRICS // INK ATHLETE</h1>
          <p>Corrección Postural en Vivo 60 FPS · Inteligencia Artificial Biomecánica</p>
        </div>
      </div>

      {/* Navegación por Pestañas (INK Pill System) */}
      <nav className="header-nav-tabs">
        {menus.map(tab => {
          const isActive = activeMenu === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectMenu(tab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.66rem',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: isActive ? '#000000' : '#22272e',
                  color: isActive ? '#a1ff4f' : '#8b949e',
                  fontWeight: 900
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Racha & Coach de Voz */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={toggleAudioCoach}
          title="Activar o desactivar motivación y corrección por voz"
          style={{
            background: audioCoachActive ? 'rgba(161, 255, 79, 0.15)' : '#14181d',
            border: `1px solid ${audioCoachActive ? '#a1ff4f' : '#22272e'}`,
            color: audioCoachActive ? '#a1ff4f' : '#8b949e',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            transition: 'all 0.3s ease'
          }}
        >
          <span>{audioCoachActive ? '🔊 VOZ IA: ON' : '🔇 VOZ IA: OFF'}</span>
        </button>

        <div className="streak-pill">
          <span>🔥 RACHA: 5 DÍAS</span>
        </div>
      </div>
    </header>
  );
}
