import React from 'react';

export default function GuideView({ onGoToLive }) {
  return (
    <div className="guide-view-container" style={{ padding: '24px 32px', width: '100%', maxWidth: 'none', margin: '0', color: '#ffffff' }}>
      {/* Banner de Guía Fácil */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(56, 189, 248, 0.12))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '2.5rem' }}>💡</span>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              ¿Cómo funciona? Guía Rápida para Todos
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#f59e0b', margin: '4px 0 0 0', fontWeight: 600 }}>
              Sin tecnicismos: aprende a usar tu entrenador personal inteligente en menos de 1 minuto
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
          No necesitas ser experto en deportes ni en informática. Nuestra Inteligencia Artificial detecta automáticamente tu cuerpo 
          a través de tu cámara o de cualquier video que subas, ayudándote a prevenir lesiones y a contar tus repeticiones.
        </p>
      </div>

      {/* Los 3 Pasos Sencillos */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
        🚀 Empieza en 3 Pasos Sencillos
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-14px', left: '20px', background: '#38bdf8', color: '#000', fontWeight: 800, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '12px' }}>
            PASO 1
          </div>
          <div style={{ fontSize: '2.5rem', margin: '14px 0 12px 0' }}>📹 / 📁</div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>Elige tu Fuente de Video</h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Ve al menú <b>"Estudio en Vivo"</b> y presiona <b>USAR MI CÁMARA WEB</b> para encender la cámara de tu celular/laptop, o haz clic en <b>SUBIR CUALQUIER VIDEO</b> si prefieres analizar una grabación que ya tengas.
          </p>
        </div>

        <div className="card" style={{ padding: '24px', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.25)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-14px', left: '20px', background: '#10b981', color: '#000', fontWeight: 800, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '12px' }}>
            PASO 2
          </div>
          <div style={{ fontSize: '2.5rem', margin: '14px 0 12px 0' }}>🏃‍♂️</div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>Aléjate 1.5 Metros y Ejercítate</h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Aléjate un poco para que la cámara vea al menos tu torso o cuerpo completo. Comienza a hacer tus sentadillas, flexiones o abdominales de manera natural a tu propio ritmo.
          </p>
        </div>

        <div className="card" style={{ padding: '24px', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.25)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-14px', left: '20px', background: '#a855f7', color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '12px' }}>
            PASO 3
          </div>
          <div style={{ fontSize: '2.5rem', margin: '14px 0 12px 0' }}>🗣️ / 📊</div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>Recibe Diagnóstico Instantáneo</h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            El esqueleto virtual se dibujará sobre ti. Si está en <b style={{ color: '#10b981' }}>Verde</b> tu postura es perfecta. Si cambia a <b style={{ color: '#f59e0b' }}>Amarillo/Rojo</b>, lee la tarjeta de retroalimentación para corregir el error de inmediato.
          </p>
        </div>
      </div>

      {/* Botón grande para saltar a probar */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <button
          onClick={onGoToLive}
          style={{
            padding: '16px 36px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #38bdf8)',
            color: '#000',
            fontSize: '1.1rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
            transition: 'transform 0.2s ease'
          }}
        >
          ⚡ ¡ENTENDIDO! IR AL ESTUDIO Y PROBAR AHORA
        </button>
      </div>

      {/* Preguntas Frecuentes (FAQ) */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
        ❓ Preguntas Frecuentes (Explicadas de forma sencilla)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
            🔒 ¿Mis videos o imágenes se guardan en internet o los puede ver alguien más?
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            <b>No, absolutamente nunca.</b> El 100% del reconocimiento del cuerpo y el cálculo biomecánico ocurre de forma local y privada dentro del procesador de tu propio navegador web. Ningún video o imagen es enviado a servidores ni guardado en la nube.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
            🏋️ ¿Qué significa el puntaje de "Calidad Postural 0 - 100%"?
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Es una calificación instantánea que compara tus ángulos de rodilla, cadera, espalda y brazos con el modelo ideal de ejecución de deportistas profesionales del dataset Penn Action. Un puntaje superior al 85% indica una técnica segura y libre de riesgo de lesiones.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a855f7', marginBottom: '8px' }}>
            📱 ¿Puedo usar esta aplicación desde mi teléfono móvil (iPhone o Android)?
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            <b>¡Sí!</b> La interfaz es totalmente adaptable a pantallas táctiles y funciona directamente con la cámara delantera o trasera de cualquier smartphone moderno en Chrome o Safari sin necesidad de instalar nada.
          </p>
        </div>
      </div>
    </div>
  );
}
