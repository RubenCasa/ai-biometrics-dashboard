import React from 'react';

export default function Header({ onToggleSidebar }) {
  return (
    <header>
      <div className="brand">
        <button
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div className="brand-icon">🏋️</div>
        <div className="brand-text">
          <h1>AI BIOMETRICS DASHBOARD</h1>
          <p>Corrección Postural Inteligente | Cualquier Ejercicio · Cualquier Persona</p>
        </div>
      </div>
      <div className="header-badges">
        <span className="tech-badge">MediaPipe Pose IA</span>
        <span className="tech-badge">Biomecánica Avanzada</span>
        <span className="tech-badge badge-webcam">📹 Webcam + Video</span>
        <span className="tech-badge" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
          ● EN VIVO
        </span>
      </div>
    </header>
  );
}
