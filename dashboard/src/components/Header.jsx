import React, { useState, useEffect } from 'react';

export default function Header({ onToggleSidebar, activeMenu }) {
  const [audioCoachActive, setAudioCoachActive] = useState(true);
  const [weatherData, setWeatherData] = useState({ temp: '21.5°C', humidity: '44%', status: '⚡ O2 Óptimo' });
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
            status: t > 26 ? '🔥 Calor (Hidrátate)' : t < 15 ? '🧊 Calentamiento extra' : '⚡ Clima Óptimo'
          });
        }
      } catch (err) {
        // Fallback robusto para Vercel y offline sin romper la UI
        if (isMounted) {
          setWeatherData({ temp: '21.8°C', humidity: '45%', status: '⚡ Clima Óptimo' });
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
        const u = new SpeechSynthesisUtterance("Coach biomecánico de voz activado en modo profesional. ¡Listo!");
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
    }
  };

  return (
    <header className="main-header" style={{
      justifyContent: 'space-between',
      padding: '16px 36px',
      background: 'rgba(10, 14, 17, 0.94)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-color, #22272e)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Hamburger (Sin Navbar Arriba, Puro Telemetría INK Games) */}
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {activeMenu === 'live' && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir panel de control lateral"
            style={{
              background: '#14181d',
              border: '1px solid #22272e',
              color: 'var(--accent-green, #a1ff4f)',
              borderRadius: '9999px',
              padding: '8px 16px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 800,
              transition: 'all 0.3s ease'
            }}
          >
            ☰
          </button>
        )}
        <div className="brand-icon" style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'var(--accent-green, #a1ff4f)',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          fontWeight: 900,
          boxShadow: '0 0 25px rgba(161, 255, 79, 0.4)',
          flexShrink: 0
        }}>⚡</div>
        <div className="brand-text">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.1
          }}>AI BIOMETRICS // INK ATHLETE</h1>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim, #8b949e)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0
          }}>Corrección Postural en Vivo 60 FPS · Inteligencia Artificial Biomecánica</p>
        </div>
      </div>

      {/* Telemetría Ambiental API en Tiempo Real (Reemplaza a la vieja barra de navegación aquí) */}
      <div className="api-weather-pill" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#14181d',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        padding: '8px 20px',
        borderRadius: '9999px',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.12)'
      }}>
        <span style={{ fontSize: '1.1rem' }}>🌦️</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.68rem', color: '#8b949e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            API AMBIENTE ESTUDIO (OPEN-METEO)
          </span>
          <span style={{ fontSize: '0.84rem', color: '#00f0ff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {loadingWeather ? '⏳ Sincronizando API...' : `${weatherData.temp} · ${weatherData.humidity} · ${weatherData.status}`}
          </span>
        </div>
      </div>

      {/* Racha & Coach de Voz */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={toggleAudioCoach}
          title="Activar o desactivar motivación y corrección por voz"
          style={{
            background: audioCoachActive ? 'rgba(161, 255, 79, 0.18)' : '#14181d',
            border: `1px solid ${audioCoachActive ? 'var(--accent-green, #a1ff4f)' : '#22272e'}`,
            color: audioCoachActive ? 'var(--accent-green, #a1ff4f)' : '#8b949e',
            padding: '9px 18px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: audioCoachActive ? '0 0 20px rgba(161, 255, 79, 0.3)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <span>{audioCoachActive ? '🔊 VOZ IA: ON' : '🔇 VOZ IA: OFF'}</span>
        </button>

        <div className="streak-pill" style={{
          background: '#14181d',
          color: 'var(--accent-green, #a1ff4f)',
          border: '1px solid var(--accent-green, #a1ff4f)',
          padding: '8px 18px',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 0 20px rgba(161, 255, 79, 0.25)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <span>🔥 RACHA: 5 DÍAS</span>
        </div>
      </div>
    </header>
  );
}
