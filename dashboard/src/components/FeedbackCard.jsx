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

  // Síntesis Neural + Inteligencia IA Ultra-Rápida y Futurista (Sin demoras, voz agil de IA)
  const speakFeedback = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setStatusText('⚡ INFERENCIA NEURAL EN CURSO...');

    try {
      // 1. Diagnóstico Biomecánico Futurista Instantáneo (0 milisegundos de latencia)
      let aiCoachAdvice = '';
      if (seq.clase === 0) {
        aiCoachAdvice = `[Sistema IA INK Games]: Análisis biométrico óptimo en ${seq.action || 'ejercicio'}. Precisión del ${confPercentage} por ciento. Ángulos articulares alineados. Mantén el ritmo y la profundidad.`;
      } else if (seq.clase === 1) {
        aiCoachAdvice = `[Alerta Neural Biomecánica]: Atención en ${seq.action || 'tu postura'}. Detectada inclinación de espalda o pérdida de eje. Activa el core e incorpora el tronco de inmediato para máxima seguridad.`;
      } else {
        aiCoachAdvice = `[Precaución Biomecánica]: Alerta en articulaciones durante ${seq.action || 'la ejecución'}. Evita el valgo de rodilla y estabiliza el recorrido ahora mismo.`;
      }

      // Si hay un mensaje específico personalizado del motor de detección en vivo, lo incluimos al inicio
      if (seq.feedback && !seq.feedback.includes('Analizando') && !seq.feedback.includes('Esperando')) {
        aiCoachAdvice = `[Diagnóstico IA en Vivo]: ${seq.feedback} Precisión ${confPercentage} por ciento.`;
      }

      // Intentamos enriquecer con LLM rápido de Pollinations SI responde en menos de 650ms (ultra fast)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 650);
        const promptText = `Eres una IA futurista de biomecánica estilo INK Games. El atleta hace ${seq.action || 'ejercicio'}. Score: ${confPercentage}%. Alerta actual: "${seq.feedback}". Dame en UNA sola oración futurista, rápida y precisa en español qué corregir. Empezando con "[Comando IA]:"`;

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
          if (textData && textData.trim().length > 10 && textData.trim().length < 220) {
            aiCoachAdvice = textData.trim();
          }
        }
      } catch (fastTimeoutErr) {
        // Si tarda más de 650ms, usamos el diagnóstico instantáneo futurista para cero esperas
      }

      // 2. Síntesis Neural Rápida con Amazon Polly (StreamElements API - Voz Neural "Mia" / "Lucia" a 1.22x de velocidad)
      let audioPlayed = false;
      try {
        const encodedText = encodeURIComponent(aiCoachAdvice);
        // "Mia" es una voz neural en español moderna, ultraclara y con tono tecnológico
        const streamElementsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Mia&text=${encodedText}`;
        const audio = new Audio(streamElementsUrl);
        
        // Aceleramos la reproducción a 1.22x para que hable ágil, rápido y con estilo de computadora futurista IA
        audio.playbackRate = 1.22;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio timeout')), 4500);
          audio.onended = () => { clearTimeout(timeout); audioPlayed = true; resolve(); };
          audio.onerror = (e) => { clearTimeout(timeout); reject(e); };
          audio.play().catch(reject);
        });
      } catch (ttsError) {
        // Fallback si la voz en la nube tarda
      }

      // 3. Fallback Instantáneo al motor Neural/Natural de alta velocidad del navegador (1.25x speed)
      if (!audioPlayed && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiCoachAdvice);
        utterance.lang = 'es-ES';
        utterance.rate = 1.25; // Habla rápido, dinámico y con estilo IA tecnológica
        utterance.pitch = 1.05;

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
    } catch (e) {
      console.error('Error con voz IA rápida:', e);
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
