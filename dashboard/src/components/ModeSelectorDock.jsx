import React, { useState, useEffect } from 'react';

export default function ModeSelectorDock({ activeMenu, onSelectMenu }) {
  const [quote, setQuote] = useState({
    text: "La disciplina es el puente entre tus metas y tus logros deportivos.",
    author: "AI BIOMECHANICS COACH PRO"
  });

  // Consulta API dinámica de Motivación y Consejos Deportivos en tiempo real
  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      try {
        // Usamos una consulta limpia a API de frases motivacionales deportivas/filosóficas
        const res = await fetch('https://api.quotable.io/random?tags=sports,motivational,wisdom');
        if (!res.ok) throw new Error("API quote error");
        const data = await res.json();
        if (isMounted && data.content) {
          setQuote({
            text: data.content,
            author: data.author?.toUpperCase() || "ATHLETE PRO"
          });
        }
      } catch (e) {
        // Frases rotativas locales si la API externa tarda o en modo offline de Vercel
        const fallbackQuotes = [
          { text: "El movimiento perfecto no se logra cuando no queda nada que agregar, sino cuando no queda ningún error articular en 60 FPS.", author: "BIOMECÁNICA INK PRO" },
          { text: "Tu espalda baja y rodillas son tus activos más valiosos. Mantén el ángulo a 90° y deja que la IA guíe tu técnica.", author: "COACH IA MEDIAPIPE" },
          { text: "La consistencia vence al talento cuando el talento no mide sus ángulos de ejecución.", author: "PENN ACTION LAB" }
        ];
        if (isMounted) {
          const rand = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
          setQuote(rand);
        }
      }
    };

    fetchInsight();
  }, []);

  const modes = [
    { id: 'live', icon: '🏋️', label: 'Estudio AI en Vivo', badge: '60 FPS IA', desc: 'Cámara & Video MP4' },
    { id: 'demos', icon: '🎬', label: 'Galería Didáctica', badge: '5 Ejercicios', desc: 'Ejemplos listos' },
    { id: 'dataset', icon: '🔬', label: 'Dataset & Ciencia', badge: 'Penn Action', desc: '13 Articulaciones 2D' },
    { id: 'guide', icon: '📚', label: 'Guía & Rutinas', badge: 'Principiantes', desc: 'Aprende biomecánica' }
  ];

  return (
    <div className="mode-selector-dock" style={{
      width: '100%',
      padding: '0 36px',
      margin: '24px 0 12px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Barra de Mando y Pestañas de Modo (Reemplazo moderno e interactivo del navbar eliminado) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px'
      }}>
        {modes.map((mode) => {
          const isActive = activeMenu === mode.id;
          return (
            <div
              key={mode.id}
              onClick={() => onSelectMenu(mode.id)}
              style={{
                background: isActive ? 'var(--accent-green, #a1ff4f)' : '#14181d',
                border: `1px solid ${isActive ? 'var(--accent-green, #a1ff4f)' : 'var(--border-color, #22272e)'}`,
                borderRadius: '18px',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: isActive ? '0 10px 30px rgba(161, 255, 79, 0.35)' : '0 8px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transform: isActive ? 'translateY(-3px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  fontSize: '1.8rem',
                  background: isActive ? '#000000' : '#1c2128',
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.3s ease'
                }}>
                  {mode.icon}
                </span>
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: isActive ? '#000000' : '#ffffff',
                    margin: '0 0 3px 0',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em'
                  }}>
                    {mode.label}
                  </h3>
                  <p style={{
                    fontSize: '0.74rem',
                    color: isActive ? 'rgba(0,0,0,0.75)' : '#8b949e',
                    margin: 0,
                    fontWeight: 600
                  }}>
                    {mode.desc}
                  </p>
                </div>
              </div>

              <span style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '9999px',
                background: isActive ? '#000000' : '#22272e',
                color: isActive ? 'var(--accent-green, #a1ff4f)' : '#8b949e',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0
              }}>
                {mode.badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ticker Dinámico con API de Citas y Motivación Deportiva */}
      <div style={{
        background: '#12161b',
        border: '1px solid rgba(161, 255, 79, 0.25)',
        borderRadius: '16px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.3rem' }}>💡</span>
          <span style={{ fontSize: '0.86rem', color: '#e2e8f0', fontWeight: 600, fontStyle: 'italic' }}>
            "{quote.text}"
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green, #a1ff4f)', fontWeight: 800, textTransform: 'uppercase' }}>
            — {quote.author}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: '#00f0ff', fontWeight: 800 }}>⚡ INFERENCIA NEURAL 2D/3D EN VIVO</span>
        </div>
      </div>
    </div>
  );
}
