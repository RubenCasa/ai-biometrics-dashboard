import React from 'react';
import { EXAMPLE_VIDEOS } from '../data/sequences';

export default function DemosGallery({ onSelectDemo }) {
  const demoDetails = {
    "DEMO-SQUAT": {
      musculos: "Cuádriceps, Glúteos y Core",
      nivel: "Principiante - Medio",
      errorComun: "Rodillas hacia adentro (Valgo) o espalda muy inclinada hacia adelante.",
      solucionIA: "La IA mide en tiempo real el ángulo cadera-rodilla-tobillo para asegurar un descenso a 90° sin colapso lumbar.",
      icon: "🦵",
      color: "var(--accent-green, #a1ff4f)"
    },
    "DEMO-PUSHUP": {
      musculos: "Pecho, Tríceps y Deltoides Anterior",
      nivel: "Medio",
      errorComun: "Dejar caer la cadera o abrir los codos a 90° respecto al torso.",
      solucionIA: "Detecta la alineación recta entre hombros, cadera y tobillos para proteger la zona lumbar y las articulaciones del hombro.",
      icon: "💪",
      color: "var(--accent-amber, #ffb703)"
    },
    "DEMO-BENCH": {
      musculos: "Pectoral Mayor y Tríceps",
      nivel: "Medio - Avanzado",
      errorComun: "Asimetría al subir la barra o rebote peligroso en el pecho.",
      solucionIA: "Evalúa la simetría horizontal entre ambas muñecas y codos durante todo el rango de recorrido.",
      icon: "🏋️‍♂️",
      color: "var(--accent-blue, #00f0ff)"
    },
    "DEMO-SITUP": {
      musculos: "Recto Abdominal y Flexores de Cadera",
      nivel: "Principiante",
      errorComun: "Tirar del cuello con las manos o encorvar excesivamente la columna cervical.",
      solucionIA: "Alerta de inmediato si la distancia entre la cabeza y el torso muestra tensión cervical peligrosa.",
      icon: "🧘‍♂️",
      color: "var(--accent-red, #ff3366)"
    },
    "DEMO-MIXTO": {
      musculos: "Cuerpo Completo (Rutina Multi-ejercicio)",
      nivel: "Todos los niveles",
      errorComun: "Perder la técnica cuando aparece la fatiga al cambiar de ejercicio.",
      solucionIA: "El clasificador neuronal identifica automáticamente qué ejercicio estás haciendo y cuenta cada repetición válida.",
      icon: "⚡",
      color: "var(--accent-purple, #c084fc)"
    }
  };

  return (
    <div className="gallery-container" style={{ padding: '24px 36px', width: '100%', maxWidth: 'none', margin: '0', color: '#ffffff' }}>
      {/* Banner de bienvenida didáctico estilo INK Games */}
      <div className="card" style={{
        background: '#14181d',
        border: '1px solid var(--accent-green, #a1ff4f)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
          <span style={{ fontSize: '2.6rem' }}>🎯</span>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Galería Didáctica de Ejercicios // INK ATHLETE
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--accent-green, #a1ff4f)', fontWeight: 700, margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Haz clic en cualquier ejercicio para ver cómo la Inteligencia Artificial corrige y protege tu postura
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
          Cada uno de estos ejemplos incluye análisis cinemático en tiempo real (60 FPS), conteo automático de repeticiones y diagnóstico preventivo contra lesiones de articulaciones, espalda y rodillas.
        </p>
      </div>

      {/* Grid de Ejercicios */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {EXAMPLE_VIDEOS.map((demo) => {
          const info = demoDetails[demo.id] || {
            musculos: "Cuerpo completo",
            nivel: "Todos los niveles",
            errorComun: "Desviación del eje vertical.",
            solucionIA: "Inferencia continua MediaPipe 3D.",
            icon: "⚡",
            color: "var(--accent-blue, #00f0ff)"
          };

          return (
            <div
              key={demo.id}
              className="card"
              style={{
                background: '#14181d',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '2.4rem', background: '#1c2128', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      {info.icon}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', margin: 0, textTransform: 'uppercase' }}>
                        {demo.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: info.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {info.nivel}
                      </span>
                    </div>
                  </div>
                  <span className={`tag tag-${demo.type}`} style={{ fontSize: '0.74rem', padding: '5px 12px', borderRadius: '9999px', fontWeight: 900 }}>
                    {demo.type === 'correct' ? '✅ ÓPTIMO' : '⚠️ CORRECCIÓN'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '18px', lineHeight: 1.5 }}>
                  {demo.desc}
                </p>
                <div style={{
                  background: '#0a0e11',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '0.82rem' }}>
                    <b style={{ color: 'var(--text-dim)' }}>💪 MÚSCULOS CLAVE:</b>{' '}
                    <span style={{ color: '#cbd5e1' }}>{info.musculos}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>
                    <b style={{ color: 'var(--accent-red, #ff3366)' }}>❌ ERROR FRECUENTE:</b>{' '}
                    <span style={{ color: '#fca5a5' }}>{info.errorComun}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>
                    <b style={{ color: 'var(--accent-blue, #00f0ff)' }}>🤖 SOLUCIÓN IA:</b>{' '}
                    <span style={{ color: '#bae6fd' }}>{info.solucionIA}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectDemo(demo)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  border: `1px solid ${info.color}`,
                  background: info.color,
                  color: '#000000',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  boxShadow: `0 4px 20px ${info.color}35`,
                  transition: 'all 0.3s ease'
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
