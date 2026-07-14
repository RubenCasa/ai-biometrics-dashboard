import React from 'react';

export default function Header({ onToggleSidebar, activeMenu, onSelectMenu }) {
  const menus = [
    { id: 'live', label: '🏋️ Estudio en Vivo', badge: 'IA' },
    { id: 'demos', label: '🎬 Galería Demos', badge: '5 Videos' },
    { id: 'dataset', label: '🔬 Dataset & Ciencia', badge: 'Penn Action' },
    { id: 'guide', label: '💡 Guía Fácil', badge: 'Para todos' }
  ];

  return (
    <header className="main-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'rgba(10, 15, 29, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(56, 189, 248, 0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Brand logo & hamburguesa */}
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {activeMenu === 'live' && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel de control lateral"
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        )}
        <div className="brand-icon" style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }}>🏋️</div>
        <div className="brand-text">
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px', background: 'linear-gradient(90deg, #ffffff, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI BIOMETRICS DASHBOARD
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, fontWeight: 500 }}>
            Corrección Postural con Inteligencia Artificial · Cualquier Ejercicio & Persona
          </p>
        </div>
      </div>

      {/* Navegación por Pestañas (Diferentes Menús) */}
      <nav className="header-nav-tabs" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {menus.map(tab => {
          const isActive = activeMenu === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectMenu(tab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.15))' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 15px rgba(56, 189, 248, 0.25)' : 'none'
              }}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#000' : '#cbd5e1',
                  fontWeight: 800
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Badges tecnológicos a la derecha */}
      <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="tech-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '20px' }}>
          ● IA EN VIVO 60 FPS
        </span>
      </div>
    </header>
  );
}
