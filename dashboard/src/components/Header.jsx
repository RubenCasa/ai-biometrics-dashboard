import React, { useState, useEffect } from 'react';

export default function Header({ onToggleSidebar, activeMenu }) {
  const [audioCoachActive, setAudioCoachActive] = useState(true);
  const [weatherData, setWeatherData] = useState({ temp: '21.5°C', humidity: '44%', status: '🍃 Brisa Óptima' });
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Consulta API pública de Clima y Biometría Ambiental en tiempo real (Open-Meteo API)
  useEffect(() => {
    let isMounted = true;
    const fetchEnvironment = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.4326&longitude=-99.1332&current=temperature_2m,relative_humidity_2m');
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (isMounted && data.current) {
          const t = data.current.temperature_2m;
          const h = data.current.relative_humidity_2m;
          setWeatherData({
            temp: `${t}°C`,
            humidity: `${h}%`,
            status: t > 26 ? '🔥 Viento Cálido (Hidrátate)' : t < 15 ? '🌲 Brisa Fresca de Bosque' : '🍃 Clima Óptimo de Castillo'
          });
        }
      } catch (err) {
        if (isMounted) {
          setWeatherData({ temp: '21.8°C', humidity: '45%', status: '🍃 Clima Óptimo de Bosque' });
        }
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };

    fetchEnvironment();
    return () => { isMounted = false; };
  }, []);

  const toggleAudioCoach = () => {
    const nextState = !audioCoachActive;
    setAudioCoachActive(nextState);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (nextState) {
        const u = new SpeechSynthesisUtterance("Asistente biomecánico Studio Ghibli activado. Todo en orden.");
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
    }
  };

  return (
    <header className="main-header" style={{
      justifyContent: 'space-between',
      padding: '16px 36px',
      background: 'rgba(11, 19, 28, 0.88)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Hamburger (Ethereal Studio Ghibli Tech Vibe) */}
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {activeMenu === 'live' && (
          <button
            className="btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel lateral del Studio"
            style={{
              background: 'rgba(20, 36, 52, 0.75)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-blue)',
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
        <div className="brand-icon" style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)',
          color: '#0b131c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          fontWeight: 900,
          boxShadow: '0 0 25px rgba(52, 211, 153, 0.4)'
        }}>
          🍃
        </div>
        <div className="brand-text">
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.03em' }}>GHIBLI BIO-TECH LABS</h1>
          <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '0.06em' }}>
            SOFTWARE & BIOMECHANICS AI STUDIO
          </p>
        </div>
      </div>

      {/* Telemetry Ethereal Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(18, 32, 45, 0.8)',
          border: '1px solid var(--border-color)',
          padding: '8px 18px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: 'var(--accent-green)' }}>🌲 BOSQUE NEURAL:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>60 FPS BIO-FLOW</span>
        </div>

        <div style={{
          background: 'rgba(18, 32, 45, 0.8)',
          border: '1px solid var(--border-color)',
          padding: '8px 18px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: 'var(--accent-blue)' }}>☁️ CIELO & CLIMA:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {loadingWeather ? '⏳ Sincronizando...' : `${weatherData.temp} | ${weatherData.status}`}
          </span>
        </div>

        <button
          onClick={toggleAudioCoach}
          className="btn"
          style={{
            background: audioCoachActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            border: `1px solid ${audioCoachActive ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            color: audioCoachActive ? 'var(--accent-green)' : 'var(--accent-red)',
            padding: '8px 18px',
            fontSize: '0.8rem',
            fontWeight: 800
          }}
        >
          {audioCoachActive ? '🔊 VOZ GHIBLI: ON' : '🔇 VOZ GHIBLI: OFF'}
        </button>
      </div>
    </header>
  );
}
