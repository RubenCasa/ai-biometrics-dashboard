import React, { useState } from 'react';

export default function FeedbackCard({ seq }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('🔊 ESCUCHAR CORRECCIÓN POR VOZ (IA)');

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

  // Síntesis Neural + Inteligencia IA 100% GRATUITA (Sin API Keys ni costos)
  const speakFeedback = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setStatusText('⚡ GENERANDO CONSEJO Y VOZ NEURAL...');

    try {
      // 1. Generar consejo inteligente en vivo con IA Libre (Pollinations.ai / Qwen o Prompt Biomecánico Inteligente)
      let aiCoachAdvice = seq.feedback || 'Analizando postura biomecánica en vivo.';
      
      try {
        const promptText = `Eres el entrenador olímpico IA de INK Games. El usuario realiza el ejercicio ${seq.action || 'ejercicio biomecánico'}. Su puntuación actual es ${confPercentage}% (Clase ${seq.clase === 0 ? 'Óptima' : 'Alerta'}). Alerta técnica actual: "${seq.feedback}". Dame en UNA sola oración corta, motivadora y precisa en español lo que debe hacer o corregir ahora mismo.`;
        
        // Timeout corto para que sea instantáneo y nunca se quede colgado si la red es lenta
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const aiResponse = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: promptText }],
            model: 'qwen'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          const textData = await aiResponse.text();
          if (textData && textData.trim().length > 5 && textData.trim().length < 250) {
            aiCoachAdvice = textData.trim();
          }
        }
      } catch (err) {
        // Si falla o tarda más de 3.5s por conexión, usa el diagnóstico inteligente procesado localmente
        if (seq.clase === 0) {
          aiCoachAdvice = `¡Excelente técnica en ${seq.action || 'este ejercicio'}! Mantén la estabilidad y el ritmo, vas con una calidad del ${confPercentage} por ciento.`;
        } else if (seq.clase === 1) {
          aiCoachAdvice = `¡Atención! Detecto una alerta en tu postura. Endereza la espalda y activa el core inmediatamente.`;
        } else {
          aiCoachAdvice = `Cuidado con la alineación de tus extremidades en ${seq.action || 'el movimiento'}. Concéntrate en la profundidad y el control.`;
        }
      }

      // 2. Síntesis Neural Gratis con Amazon Polly Neural (StreamElements API - Voz "Lupe" / "Mia")
      try {
        const encodedText = encodeURIComponent(aiCoachAdvice);
        const streamElementsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Lupe&text=${encodedText}`;
        const audio = new Audio(streamElementsUrl);
        
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play().catch(reject);
        });
      } catch (ttsError) {
        // 3. Fallback a voz Neural Natural del navegador si el audio stream falla
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(aiCoachAdvice);
          utterance.lang = 'es-ES';
          utterance.rate = 1.05;

          // Seleccionar voz natural/neural si está instalada en el sistema
          const voices = window.speechSynthesis.getVoices();
          const bestVoice = voices.find(v => 
            (v.lang.includes('es') || v.lang.includes('ES')) &&
            (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Alvaro') || v.name.includes('Dalia'))
          ) || voices.find(v => v.lang.includes('es'));

          if (bestVoice) utterance.voice = bestVoice;

          await new Promise(resolve => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
            window.speechSynthesis.speak(utterance);
          });
        }
      }
    } catch (e) {
      console.error('Error general de voz IA:', e);
    } finally {
      setIsSpeaking(false);
      setStatusText('🔊 ESCUCHAR CORRECCIÓN POR VOZ (IA)');
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

      {/* Botón de Síntesis Neural IA Libre */}
      <button
        onClick={speakFeedback}
        disabled={isSpeaking}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          border: isSpeaking ? '1px solid #a1ff4f' : '1px solid rgba(56, 189, 248, 0.4)',
          background: isSpeaking
            ? 'linear-gradient(135deg, rgba(161, 255, 79, 0.25), rgba(0, 240, 255, 0.2))'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(16, 185, 129, 0.12))',
          color: '#ffffff',
          fontSize: '0.88rem',
          fontWeight: 800,
          cursor: isSpeaking ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: isSpeaking ? '0 0 15px rgba(161, 255, 79, 0.4)' : 'none'
        }}
      >
        <span>{statusText}</span>
      </button>
    </div>
  );
}
