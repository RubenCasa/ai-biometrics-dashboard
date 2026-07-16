import React, { useState, useEffect } from 'react';

export default function ModeSelectorDock({ activeMenu, onSelectMenu }) {
  const [quote, setQuote] = useState({
    text: "El movimiento perfecto no se logra cuando no queda nada que agregar, sino cuando no queda ningún error articular en 60 FPS.",
    author: "AI BIOMECHANICS COACH PRO"
  });

  // Consulta API dinámica de Motivación y Consejos Deportivos en tiempo real
  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      try {
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

  return (
    <div className="mode-selector-dock" style={{
      width: '100%',
      padding: '16px 36px',
      margin: '0',
      background: '#0a0e11',
      borderBottom: '1px solid var(--border-color, #22272e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Ticker Dinámico con API de Citas y Motivación Deportiva (Sin tarjetas ni navegación redundante) */}
      <div style={{
        background: '#14181d',
        border: '1px solid var(--accent-green, #a1ff4f)',
        borderRadius: '9999px',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexGrow: 1,
        boxShadow: '0 0 25px rgba(161, 255, 79, 0.15)'
      }}>
        <span style={{ fontSize: '1.3rem' }}>💡</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700, fontStyle: 'italic' }}>
            "{quote.text}"
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green, #a1ff4f)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            — {quote.author}
          </span>
        </div>
      </div>


    </div>
  );
}
