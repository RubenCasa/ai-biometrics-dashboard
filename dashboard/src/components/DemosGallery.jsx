import React from 'react';
import { EXAMPLE_VIDEOS } from '../data/sequences';

export default function DemosGallery({ onSelectDemo }) {
  // Información didáctica adicional para que cualquiera entienda cada ejercicio
  const demoDetails = {
    "DEMO-SQUAT": {
      musculos: "Cuádriceps, Glúteos y Core",
      nivel: "Principiante - Medio",
      errorComun: "Rodillas hacia adentro (Valgo) o espalda muy inclinada hacia adelante.",
      solucionIA: "La IA mide en tiempo real el ángulo cadera-rodilla-tobillo para asegurar un descenso a 90° sin colapso lumbar.",
      icon: "🦵",
      color: "#10b981"
    },
    "DEMO-PUSHUP": {
      musculos: "Pecho, Tríceps y Deltoides Anterior",
      nivel: "Medio",
      errorComun: "Dejar caer la cadera o abrir los codos a 90° respecto al torso.",
      solucionIA: "Detecta la alineación recta entre hombros, cadera y tobillos para proteger la zona lumbar y las articulaciones del hombro.",
      icon: "💪",
      color: "#f59e0b"
    },
    "DEMO-BENCH": {
      musculos: "Pectoral Mayor y Tríceps",
      nivel: "Medio - Avanzado",
      errorComun: "Asimetría al subir la barra o rebote peligroso en el pecho.",
      solucionIA: "Evalúa la simetría horizontal entre ambas muñecas y codos durante todo el rango de recorrido.",
      icon: "🏋️‍♂️",
      color: "#38bdf8"
    },
    "DEMO-SITUP": {
      musculos: "Recto Abdominal y Flexores de Cadera",
      nivel: "Principiante",
      errorComun: "Tirar del cuello con las manos o encorvar excesivamente la columna cervical.",
      solucionIA: "Alerta de inmediato si la distancia entre la cabeza y el torso muestra tensión cervical peligrosa.",
      icon: "🧘‍♂️",
      color: "#ef4444"
    },
    "DEMO-MIXTO": {
      musculos: "Cuerpo Completo (Rutina Multi-ejercicio)",
      nivel: "Todos los niveles",
      errorComun: "Perder la técnica cuando aparece la fatiga al cambiar de ejercicio.",
      solucionIA: "El clasificador neuronal identifica automáticamente qué ejercicio estás haciendo y cuenta cada repetición válida.",
      icon: "⚡",
      color: "#a855f7"
    }
  };

  return (
    <div className="gallery-container" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#ffffff' }}>
      {/* Banner de bienvenida didáctico */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(16, 185, 129, 0.12))',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '2.5rem' }}>🎬</span>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Galería Interactiva de Ejercicios
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#38bdf8', margin: '4px 0 0 0', fontWeight: 600 }}>
              Haz clic en cualquier ejercicio para ver cómo la Inteligencia Artificial analiza y corrige la postura en tiempo real
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
          Estos videos de demostración han sido procesados a partir de grabaciones reales en gimnasio del dataset científico <b>Penn Action</b>. 
          Al hacer clic en <b>"▶ PROBAR EN VIVO AHORA"</b>, el sistema cambiará al estudio en vivo y te mostrará el esqueleto cinemático, 
          el conteo inteligente de repeticiones y el diagnóstico biomecánico segundo a segundo.
        </p>
      </div>

      {/* Grid de videos de ejemplo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {EXAMPLE_VIDEOS.map((demo) => {
          const info = demoDetails[demo.id] || {
            musculos: "General",
            nivel: "Todos",
            errorComun: "Desalineación postural",
            solucionIA: "Análisis 2D/3D en tiempo real",
            icon: "▶️",
            color: "#38bdf8"
          };

          return (
            <div
              key={demo.id}
              className="card demo-gallery-card"
              style={{
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(15, 23, 42, 0.75)',
                border: `1px solid ${info.color}40`,
                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Resplandor superior de color */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: info.color
              }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2.2rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '14px' }}>
                      {info.icon}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {demo.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: info.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {info.nivel}
                      </span>
                    </div>
                  </div>
                  <span className={`tag tag-${demo.type}`} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px' }}>
                    {demo.type === 'correct' ? '✅ Óptimo' : '⚠️ Corrección'}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '16px', lineHeight: 1.5 }}>
                  {demo.desc}
                </p>

                {/* Caja didáctica: Músculos y Error Común */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <b style={{ color: '#94a3b8' }}>💪 Músculos clave:</b>{' '}
                    <span style={{ color: '#cbd5e1' }}>{info.musculos}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <b style={{ color: '#f87171' }}>❌ Error frecuente:</b>{' '}
                    <span style={{ color: '#fca5a5' }}>{info.errorComun}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <b style={{ color: '#38bdf8' }}>🤖 Solución IA:</b>{' '}
                    <span style={{ color: '#bae6fd' }}>{info.solucionIA}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectDemo(demo)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${info.color}, #0284c7)`,
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 6px 20px ${info.color}40`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className="gallery-btn"
              >
                <span>▶ PROBAR ESTE EJERCICIO EN VIVO</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
