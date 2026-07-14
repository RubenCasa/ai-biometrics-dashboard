import React, { useRef, useState } from 'react';
import { EXAMPLE_VIDEOS } from '../data/sequences';

export default function Sidebar({
  sequences,
  currentSeqIdx,
  onSelectSeq,
  onSelectExampleVideo,
  onUploadVideo,
  onStartWebcam
}) {
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVideo(file);
    }
  };

  const filteredDemos = EXAMPLE_VIDEOS.filter(demo =>
    demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card sidebar-card" style={{
      borderRadius: '20px',
      padding: '24px',
      background: 'rgba(18, 32, 45, 0.78)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="card-title" style={{ color: 'var(--accent-green)', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
        <span>🍃 STUDIO BIOMECÁNICO EN VIVO</span>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '20px', lineHeight: 1.5 }}>
        Conecta con tu cámara mágica o sube un vídeo del bosque para que nuestra red neural evalúe tu postura y ángulos en tiempo real:
      </p>

      {/* Botones principales Ghibli Glass */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
        <button
          className="btn"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px 20px',
            fontSize: '0.86rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-red) 0%, #e11d48 100%)',
            color: '#ffffff',
            border: '1px solid var(--accent-red)',
            borderRadius: '9999px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: '0 0 20px rgba(248, 113, 113, 0.3)'
          }}
          onClick={onStartWebcam}
        >
          📹 ACTIVAR CÁMARA WEB EN VIVO
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="video/mp4,video/quicktime,video/webm,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)',
            color: '#0b131c',
            fontSize: '0.86rem',
            fontWeight: 900,
            borderRadius: '9999px',
            cursor: 'pointer',
            border: '1px solid var(--accent-green)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 SUBIR VÍDEO O DEMO AL STUDIO
        </button>
      </div>

      {/* Buscador Rápido del Studio */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar ejercicio o rutina del bosque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: '14px',
            background: 'rgba(11, 19, 28, 0.85)',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
            fontFamily: 'var(--font-main)',
            fontSize: '0.84rem',
            outline: 'none',
            transition: 'border 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
      </div>

      {/* Lista de rutinas y ejercicios Ghibli */}
      <div className="seq-list">
        {filteredDemos.map((demo, idx) => {
          // Asignar iconos temáticos del bosque y el cielo de Studio Ghibli
          const icon = demo.title.toLowerCase().includes('situp') ? '🌲'
            : demo.title.toLowerCase().includes('squat') ? '☁️'
            : demo.title.toLowerCase().includes('pushup') ? '🔥'
            : demo.title.toLowerCase().includes('press') ? '🏰'
            : '🍃';

          return (
            <div
              key={demo.id}
              className="seq-item"
              onClick={() => onSelectExampleVideo(demo)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                    {demo.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {demo.desc}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--accent-green)',
                fontWeight: 800,
                background: 'rgba(52, 211, 153, 0.15)',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                ▶ VER
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
