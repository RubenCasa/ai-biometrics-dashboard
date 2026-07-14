import React from 'react';

export default function FeedbackCard({ seq }) {
  const progressColor =
    seq.clase === 0
      ? 'var(--accent-green, #10b981)'
      : seq.clase === 1
      ? 'var(--accent-red, #ef4444)'
      : 'var(--accent-amber, #f59e0b)';

  const confPercentage = seq.qualityScore !== undefined && seq.qualityScore > 0
    ? seq.qualityScore.toFixed(1)
    : (seq.confianza * 100).toFixed(1);

  const phaseLabel = seq.phase === 'up' ? '⬆ SUBIDA' : seq.phase === 'down' ? '⬇ BAJADA' : '— ESTABLE';

  // Síntesis de voz en español para accesibilidad universal
  const speakFeedback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(seq.feedback || 'Analizando movimiento');
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta síntesis de voz en vivo.');
    }
  };

  // Checklists didácticos según el estado para que cualquiera sepa qué corregir
  const checklistItems =
    seq.clase === 0
      ? [
          { text: "Espalda y columna vertebral neutra y segura", ok: true },
          { text: "Rango de recorrido y profundidad completa", ok: true },
          { text: "Rodillas, cadera y tobillos alineados a 90°", ok: true }
        ]
      : seq.clase === 1
      ? [
          { text: "⚠️ ALERTA: Activa la zona media (Core) y saca pecho inmediatamente", ok: false },
          { text: "⚠️ Evita tirones del cuello o curvatura en la zona lumbar", ok: false },
          { text: "💡 Consejo: Reduce la velocidad o la carga si pierdes la postura", ok: true }
        ]
      : [
          { text: "⚠️ ALERTA: Evita que las rodillas apunten hacia adentro (Valgo)", ok: false },
          { text: "⚠️ Cuida la estabilidad horizontal de codos y hombros", ok: false },
          { text: "💡 Consejo: Concentra la fuerza en glúteos y cuádriceps", ok: true }
        ];

  return (
    <div className="card feedback-box" style={{
      borderRadius: '18px',
      padding: '24px',
      background: 'rgba(15, 23, 42, 0.82)',
      border: `1px solid ${progressColor}50`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#ffffff'
    }}>
      <div>
        {/* Cabecera del diagnóstico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: progressColor, letterSpacing: '0.5px' }}>
              ● DIAGNÓSTICO EN TIEMPO REAL
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff' }}>
              {seq.nombre}
            </h3>
          </div>
          <span style={{
            background: `${progressColor}20`,
            border: `1px solid ${progressColor}`,
            color: progressColor,
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '5px 12px',
            borderRadius: '20px'
          }}>
            CLASE {seq.clase} ({seq.clase === 0 ? 'ÓPTIMO' : 'ALERTA'})
          </span>
        </div>

        {/* Barra de Calidad Postural */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: '#cbd5e1' }}>Índice de Calidad Postural (AI Score)</span>
            <span style={{ color: progressColor }}>{confPercentage}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${confPercentage}%`,
              height: '100%',
              background: progressColor,
              borderRadius: '10px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Caja de Retroalimentación en Español */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderLeft: `4px solid ${progressColor}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            📢 Instrucción del Entrenador IA
          </div>
          <p style={{ fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
            {seq.feedback}
          </p>
        </div>

        {/* Puntos de Control Biomecánico */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
            🛡️ Puntos de Control Biomecánico
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checklistItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.84rem',
                color: item.ok ? '#cbd5e1' : '#fca5a5',
                background: item.ok ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.08)',
                padding: '8px 12px',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '1rem' }}>{item.ok ? '✔' : '⚠'}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Síntesis de Voz */}
      <button
        onClick={speakFeedback}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(16, 185, 129, 0.12))',
          color: '#ffffff',
          fontSize: '0.88rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        <span>🔊 ESCUCHAR CORRECCIÓN POR VOZ (IA)</span>
      </button>
    </div>
  );
}
