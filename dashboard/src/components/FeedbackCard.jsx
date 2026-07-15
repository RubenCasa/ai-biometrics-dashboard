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

  // Síntesis Neural + Coach de Gimnasio 100% Humano y Dinámico según el video subido y ejercicio detectado
  const speakFeedback = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setStatusText('⚡ COACH HABLANDO...');

    try {
      // 1. Diagnóstico Dinámico y Preciso de Coach según el Video Subido y Ejercicio Detectado
      let aiCoachAdvice = '';
      const rawExercise = seq.exercise || seq.action || seq.nombre || 'ejercicio';
      const actionLower = rawExercise.toLowerCase();
      
      // Limpiamos el nombre para cuando es un video nuevo o ejercicio general
      const cleanName = rawExercise.split('(')[0].replace(/[0-9-_]/g, ' ').trim() || 'movimiento';

      if (seq.clase === 0) {
        // ÓPTIMO EN EL VIDEO SUBIDO / EN VIVO
        if (actionLower.includes('sentadilla') || actionLower.includes('squat')) {
          aiCoachAdvice = `¡Excelente profundidad en la sentadilla! Rompes el paralelo perfecto y empujas con fuerza con los talones, ¡sigue así!`;
        } else if (actionLower.includes('flexi') || actionLower.includes('pushup')) {
          aiCoachAdvice = `¡Buenísima flexión en el video! Espalda en tabla recta y gran rango de recorrido, ¡sigue empujando con todo!`;
        } else if (actionLower.includes('abdomin') || actionLower.includes('situp')) {
          aiCoachAdvice = `¡Perfecta contracción abdominal! Sube exhalando y controla el descenso sin tirar del cuello, ¡excelente ritmo!`;
        } else if (actionLower.includes('lunge') || actionLower.includes('zancada')) {
          aiCoachAdvice = `¡Gran estabilidad en la zancada! Rodilla firme a noventa grados y tronco perfectamente erguido, ¡muy buen equilibrio!`;
        } else if (actionLower.includes('deadlift') || actionLower.includes('peso muerto')) {
          aiCoachAdvice = `¡Espalda neutra y excelente bisagra de cadera en este peso muerto! ¡Perfecto control de la carga!`;
        } else if (actionLower.includes('plank') || actionLower.includes('plancha')) {
          aiCoachAdvice = `¡Excelente plancha! Cuerpo alineado en línea recta y core firme como una roca, ¡mantén la tensión!`;
        } else {
          aiCoachAdvice = `¡Excelente técnica detectada en tu ${cleanName}! Mantén la firmeza, el control articular y ese ritmo constante, ¡vamos!`;
        }
      } else if (seq.clase === 1) {
        // ALERTA DE ESPALDA / TRONCO EN EL VIDEO SUBIDO
        if (actionLower.includes('sentadilla') || actionLower.includes('squat')) {
          aiCoachAdvice = `¡Saca pecho ya en la sentadilla! Estás inclinando demasiado el tronco hacia adelante. Aprieta el core y baja controlando la espalda!`;
        } else if (actionLower.includes('flexi') || actionLower.includes('pushup')) {
          aiCoachAdvice = `¡No dejes caer la cadera ni arques la lumbar! Activa glúteos y abdomen para mantener la espalda completamente recta en la flexión!`;
        } else if (actionLower.includes('abdomin') || actionLower.includes('situp')) {
          aiCoachAdvice = `¡No jales el cuello con las manos! La contracción debe salir pura del core abdominal, mantén el mentón elevado!`;
        } else if (actionLower.includes('lunge') || actionLower.includes('zancada')) {
          aiCoachAdvice = `¡Endereza el tronco en la zancada! Evita inclinarte hacia adelante y mantén la columna vertical con la cadera!`;
        } else if (actionLower.includes('deadlift') || actionLower.includes('peso muerto')) {
          aiCoachAdvice = `¡Cuidado con curvar la espalda en el peso muerto! Saca pecho, retrae escápulas y aprieta fuerte la zona lumbar antes de subir!`;
        } else {
          aiCoachAdvice = `¡Atención con la postura de tu espalda en ${cleanName}! Activa tu zona media del core y endereza el tronco de inmediato!`;
        }
      } else {
        // ALERTA DE RODILLAS / EXTREMIDADES EN EL VIDEO SUBIDO
        if (actionLower.includes('sentadilla') || actionLower.includes('squat')) {
          aiCoachAdvice = `¡Cuidado con las rodillas al bajar! No dejes que colapsen hacia adentro, empuja las rodillas hacia afuera alineándolas con los pies!`;
        } else if (actionLower.includes('lunge') || actionLower.includes('zancada')) {
          aiCoachAdvice = `¡Estabiliza la rodilla delantera en la zancada! Evita que tambalee o se vaya hacia adentro, mantén firme el paso!`;
        } else if (actionLower.includes('flexi') || actionLower.includes('pushup')) {
          aiCoachAdvice = `¡Ojo con la alineación de tus codos y hombros! Controla la fase de bajada sin desestabilizar los brazos!`;
        } else {
          aiCoachAdvice = `¡Ojo con la estabilidad de tus articulaciones y extremidades en ${cleanName}! Controla bien el recorrido y el equilibrio del cuerpo!`;
        }
      }

      // 2. ÚNICA VOZ OFICIAL EN ESPAÑOL: Entrenador IA "Enrique" (Voz masculina profunda, firme y natural de coach)
      let audioPlayed = false;
      try {
        const encodedText = encodeURIComponent(aiCoachAdvice);
        // "Enrique" es la única voz oficial del Coach INK Games en español (Amazon Polly Neural)
        const streamElementsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Enrique&text=${encodedText}`;
        const audio = new Audio(streamElementsUrl);
        
        // Ritmo natural de voz humana masculina de entrenador (1.05x para no alterar el tono grave)
        audio.playbackRate = 1.05;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio timeout')), 5000);
          audio.onended = () => { clearTimeout(timeout); audioPlayed = true; resolve(); };
          audio.onerror = (e) => { clearTimeout(timeout); reject(e); };
          audio.play().catch(reject);
        });
      } catch (ttsError) {
        // Si la red no responde, usamos el respaldo local en el navegador
      }

      // 3. Respaldo Local: Garantizamos la MISMA voz masculina en español con ritmo humano natural
      if (!audioPlayed && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiCoachAdvice);
        utterance.lang = 'es-ES';
        utterance.rate = 1.05; // Cadencia humana profunda y natural de entrenador
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        // Buscamos estrictamente una voz MASCULINA en ESPAÑOL para mantener el mismo tono de coach
        const bestVoice = voices.find(v => 
          (v.lang.includes('es') || v.lang.includes('ES')) &&
          (v.name.includes('Alvaro') || v.name.includes('Pablo') || v.name.includes('Jorge') || v.name.includes('Miguel') || v.name.includes('Male'))
        ) || voices.find(v => (v.lang.includes('es') || v.lang.includes('ES')) && (v.name.includes('Natural') || v.name.includes('Online')))
          || voices.find(v => v.lang.includes('es'));

        if (bestVoice) utterance.voice = bestVoice;

        await new Promise(resolve => {
          utterance.onend = resolve;
          utterance.onerror = resolve;
          window.speechSynthesis.speak(utterance);
        });
      }
    } catch (e) {
      console.error('Error con voz única en español:', e);
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
      borderRadius: '22px',
      padding: '26px',
      background: 'linear-gradient(145deg, rgba(16, 22, 34, 0.90) 0%, rgba(10, 14, 22, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${progressColor}45`,
      boxShadow: `0 16px 40px rgba(0, 0, 0, 0.55), 0 0 24px ${progressColor}15`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#ffffff',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
    }}>
      <div>
        {/* Cabecera del diagnóstico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: progressColor,
                boxShadow: `0 0 10px ${progressColor}`,
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: progressColor, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                DIAGNÓSTICO EN TIEMPO REAL
              </span>
            </div>
            <h3 style={{
              fontSize: '1.42rem',
              fontWeight: 900,
              margin: '6px 0 0 0',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              {seq.nombre}
            </h3>
          </div>
          <div style={{
            background: `${progressColor}18`,
            border: `1px solid ${progressColor}`,
            color: progressColor,
            fontWeight: 900,
            fontSize: '0.8rem',
            padding: '6px 14px',
            borderRadius: '9999px',
            boxShadow: `0 0 16px ${progressColor}35`,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>CLASE {seq.clase}</span>
            <span>·</span>
            <span>{seq.clase === 0 ? 'ÓPTIMO' : 'ALERTA'}</span>
          </div>
        </div>

        {/* Barra de Calidad Postural (AI Score) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '14px 18px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Índice de Calidad Postural (AI Score)
            </span>
            <span style={{
              fontSize: '1.15rem',
              color: progressColor,
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              textShadow: `0 0 12px ${progressColor}`
            }}>
              {confPercentage}%
            </span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', padding: '2px' }}>
            <div style={{
              width: `${confPercentage}%`,
              height: '100%',
              background: progressColor,
              borderRadius: '999px',
              transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: `0 0 14px ${progressColor}`
            }} />
          </div>
        </div>

        {/* Caja de Retroalimentación en Español (Instrucción Entrenador IA) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: `1px solid ${progressColor}40`,
          borderLeft: `4px solid ${progressColor}`,
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '22px',
          boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#94a3b8',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>📢 INSTRUCCIÓN DEL ENTRENADOR IA</span>
          </div>
          <p style={{
            fontSize: '0.95rem',
            color: '#f8fafc',
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 600,
            letterSpacing: '0.01em'
          }}>
            {seq.feedback}
          </p>
        </div>

        {/* Puntos de Control Biomecánico */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🛡️ PUNTOS DE CONTROL BIOMECÁNICO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklistItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.88rem',
                color: item.ok ? '#e2e8f0' : '#fca5a5',
                background: item.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${item.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.35)'}`,
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 600,
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: item.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: item.ok ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  flexShrink: 0,
                  fontSize: '0.85rem'
                }}>
                  {item.ok ? '✔' : '⚠'}
                </div>
                <span style={{ lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Síntesis Neural IA Libre y Moderno */}
      <button
        onClick={speakFeedback}
        disabled={isSpeaking}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          border: isSpeaking ? '1px solid #10b981' : '1px solid #00f0ff',
          background: isSpeaking
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(0, 240, 255, 0.25) 100%)'
            : 'linear-gradient(135deg, rgba(0, 240, 255, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
          color: '#ffffff',
          fontSize: '0.92rem',
          fontWeight: 900,
          cursor: isSpeaking ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow: isSpeaking
            ? '0 0 28px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 0 22px rgba(0, 240, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-mono)'
        }}
        onMouseEnter={e => {
          if (!isSpeaking) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 240, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)';
          }
        }}
        onMouseLeave={e => {
          if (!isSpeaking) {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 0 22px rgba(0, 240, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)';
          }
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{isSpeaking ? '⚡' : '🔊'}</span>
        <span>{isSpeaking ? 'ENTRENADOR IA HABLANDO...' : statusText}</span>
      </button>
    </div>
  );
}
