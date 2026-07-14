import React from 'react';

export default function FeedbackCard({ seq }) {
  const progressColor =
    seq.clase === 0
      ? 'var(--accent-green, #34d399)'
      : seq.clase === 1
      ? 'var(--accent-amber, #fbbf24)'
      : 'var(--accent-red, #f87171)';

  const confPercentage = seq.qualityScore !== undefined && seq.qualityScore > 0
    ? seq.qualityScore.toFixed(1)
    : (seq.confianza * 100).toFixed(1);

  const phaseLabel = seq.phase === 'up' ? '⬆ ASCENSO BIOMECÁNICO' : seq.phase === 'down' ? '⬇ DESCENSO DE BOSQUE' : '— ESTABLE EN EL CIELO';

  // Síntesis de voz en español con tono de asistente Studio Ghibli
  const speakFeedback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(seq.feedback || 'Analizando movimiento en el Studio');
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta síntesis de voz en vivo.');
    }
  };

  // Checklists didácticos inspirados en la armonía del cielo, el bosque y la postura
  const checklistItems =
    seq.clase === 0
      ? [
          { text: "Espalda y columna vertebral neutra (Alineación de Cielo)", ok: true },
          { text: "Rango de recorrido y profundidad completa (Flexión del Bosque)", ok: true },
          { text: "Rodillas, cadera y tobillos alineados a 90° (Estabilidad de Castillo)", ok: true }
        ]
      : seq.clase === 1
      ? [
          { text: "⚠️ ALERTA: Activa el Core y endereza el tronco para recuperar la armonía", ok: false },
          { text: "⚠️ Evita tirones del cuello o curvatura excesiva en la zona lumbar", ok: false },
          { text: "💡 Consejo del Studio: Mantén la mirada fija al horizonte y respira fluido", ok: true }
        ]
      : [
          { text: "⚠️ ALERTA: Evita que las rodillas apunten hacia adentro (Valgo articular)", ok: false },
          { text: "⚠️ Cuida la estabilidad horizontal y el balance entre codos y hombros", ok: false },
          { text: "💡 Consejo del Studio: Afianza los pies como raíces de árbol en el suelo", ok: true }
        ];

  return (
    <div className="card feedback-box" style={{
      borderRadius: '20px',
      padding: '24px',
      background: 'rgba(18, 32, 45, 0.78)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${progressColor}50`,
      boxShadow: '0 14px 35px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#ffffff'
    }}>
      <div>
        {/* Cabecera del diagnóstico Bio-Neural Ghibli */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: progressColor, letterSpacing: '0.06em' }}>
              ● DIAGNÓSTICO BIO-NEURAL EN TIEMPO REAL
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff' }}>
              {seq.nombre}
            </h3>
          </div>
          <span style={{
            background: `${progressColor}20`,
            border: `1px solid ${progressColor}`,
            color: progressColor,
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '6px 14px',
            borderRadius: '9999px',
            boxShadow: `0 0 15px ${progressColor}40`
          }}>
            CLASE {seq.clase} ({seq.clase === 0 ? 'ARMONÍA ÓPTIMA' : 'ALERTA ARTICULAR'})
          </span>
        </div>

        {/* Barra de Calidad Postural */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ color: '#cbd5e1' }}>Índice de Calidad Postural (AI Score)</span>
            <span style={{ color: progressColor, fontFamily: 'var(--font-mono)' }}>{confPercentage}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              width: `${confPercentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${progressColor} 0%, var(--accent-blue) 100%)`,
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 0 12px ${progressColor}60`
            }} />
          </div>
        </div>

        {/* Instrucción principal del Coach */}
        <div style={{
          background: 'rgba(11, 19, 28, 0.75)',
          borderLeft: `4px solid ${progressColor}`,
          padding: '16px 18px',
          borderRadius: '0 14px 14px 0',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>{seq.clase === 0 ? '🍃' : seq.clase === 1 ? '🔥' : '☁️'}</span>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Guía del Entrenador Ghibli AI
              </span>
              <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, margin: '3px 0 0 0', lineHeight: 1.4 }}>
                {seq.feedback || "Evaluando ángulos y movimiento de cuerpo en 60 FPS..."}
              </p>
            </div>
          </div>
          <button
            onClick={speakFeedback}
            style={{
              background: `${progressColor}20`,
              border: `1px solid ${progressColor}`,
              color: progressColor,
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
            title="Escuchar corrección por voz"
          >
            🔊
          </button>
        </div>

        {/* Puntos de Control Biomecánico */}
        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '12px', letterSpacing: '0.04em' }}>
            🌲 Puntos de Control del Bosque & Cielo
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklistItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: item.ok ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                border: `1px solid ${item.ok ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`,
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.ok ? '🍃' : '🔥'}</span>
                <span style={{ color: item.ok ? '#ffffff' : 'var(--accent-amber)', fontWeight: item.ok ? 600 : 700 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer del Panel */}
      <div style={{
        marginTop: '22px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.76rem',
        color: 'var(--text-dim)'
      }}>
        <span>FASE ACTUAL: <strong style={{ color: 'var(--accent-blue)' }}>{phaseLabel}</strong></span>
        <span>LATENCIA: <strong style={{ color: 'var(--accent-green)' }}>14 ms (60 FPS)</strong></span>
      </div>
    </div>
  );
}
