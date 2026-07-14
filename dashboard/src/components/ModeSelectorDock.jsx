import React, { useState, useEffect } from 'react';

export default function ModeSelectorDock({ activeMenu, onSelectMenu }) {
  const [quote, setQuote] = useState({
    text: "El movimiento perfecto fluye como el viento entre los árboles del bosque: suave, alineado a 90° y guiado por inteligencia artificial en 60 FPS.",
    author: "GHIBLI AI BIOMECHANICS STUDIO"
  });

  // Consulta API dinámica y respaldo motivacional con toque Ghibli & Software Tech
  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      try {
        const res = await fetch('https://api.quotable.io/random?tags=technology,science,wisdom');
        if (!res.ok) throw new Error("API quote error");
        const data = await res.json();
        if (isMounted && data.content) {
          setQuote({
            text: data.content,
            author: data.author?.toUpperCase() || "GHIBLI TECH LABS"
          });
        }
      } catch (e) {
        const fallbackQuotes = [
          { text: "El movimiento perfecto fluye como el viento entre los árboles del bosque: suave, alineado a 90° y guiado por inteligencia artificial en 60 FPS.", author: "GHIBLI AI BIOMECHANICS STUDIO" },
          { text: "En nuestro laboratorio, cada línea de software y cada articulación forman una constelación de precisión y belleza.", author: "STUDIO GHIBLI SOFTWARE LAB" },
          { text: "El castillo ambulante se sostiene con magia; tu cuerpo y nuestro código se sostienen con ángulos perfectos en 3D.", author: "HOWLING NEURAL LABS" }
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
    <div className="mode-selector-dock">
      {/* Ticker Etereal y Cita Inspiradora Studio Ghibli Tech */}
      <div style={{
        background: 'rgba(18, 32, 45, 0.75)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexGrow: 1,
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.12)'
      }}>
        <span style={{ fontSize: '1.4rem' }}>🍃</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600, fontStyle: 'italic' }}>
            "{quote.text}"
          </span>
          <span style={{ fontSize: '0.76rem', color: 'var(--accent-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            — {quote.author}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          background: 'rgba(18, 32, 45, 0.8)',
          border: '1px solid var(--accent-green)',
          padding: '10px 22px',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          color: 'var(--accent-green)',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)'
        }}>
          <span>✨ INFERENCIA NEURAL GHIBLI 3D</span>
        </div>
      </div>
    </div>
  );
}
