import React, { useState } from 'react';

export default function Header({ onToggleSidebar, activeMenu, onSelectMenu }) {
  const [audioCoachActive, setAudioCoachActive] = useState(true);

  const menus = [
    { id: 'live', label: '🏋️ Estudio en Vivo', badge: 'IA 60FPS' },
    { id: 'demos', label: '🎬 Galería Demos', badge: '5 Ejercicios' },
    { id: 'dataset', label: '🔬 Dataset & Ciencia', badge: 'Penn Action' },
    { id: 'guide', label: '🏆 Guía & Rutinas', badge: 'Principiantes' }
  ];

  const toggleAudioCoach = () => {
    const nextState = !audioCoachActive;
    setAudioCoachActive(nextState);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (nextState) {
        const u = new SpeechSynthesisUtterance("Coach biomecánico de voz activado. ¡Vamos por esas repeticiones perfectas!");
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
    }
  };

  return (
    <header className="main-header">
      {/* Brand & Hamburger */}
      <div className="brand">
        {activeMenu === 'live' && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel de control lateral"
            style={{
              background: 'rgba(0, 210, 255, 0.15)',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              color: '#00d2ff',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '1.25rem',
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            ☰
          </button>
        )}
        <div className="brand-icon">⚡</div>
        <div className="brand-text">
          <h1>AI BIOMETRICS ATHLETE PRO</h1>
          <p>Corrección Postural en Vivo con Inteligencia Artificial · ¡Entrena como un Profesional!</p>
        </div>
      </div>

      {/* Navegación por Pestañas Motivacionales */}
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
                  borderRadius: '12px',
                  background: isActive ? '#000000' : 'rgba(255, 255, 255, 0.12)',
                  color: isActive ? '#00ff88' : '#cbd5e1',
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
            background: audioCoachActive ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${audioCoachActive ? '#00ff88' : 'rgba(255,255,255,0.2)'}`,
            color: audioCoachActive ? '#00ff88' : '#94a3b8',
            padding: '7px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{audioCoachActive ? '🔊 VOZ IA: ON' : '🔇 VOZ IA: OFF'}</span>
        </button>

        <div className="streak-pill">
          <span>🔥 Racha: 5 Días</span>
        </div>
      </div>
    </header>
  );
}
