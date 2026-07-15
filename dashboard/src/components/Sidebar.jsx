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
      borderRadius: '18px',
      padding: '22px',
      background: 'rgba(20, 24, 29, 0.92)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="card-title" style={{ color: 'var(--accent-green)', fontSize: '1rem', letterSpacing: '-0.02em' }}>
        <span>⚡ INFERENCIA EN VIVO</span>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '18px', lineHeight: 1.4 }}>
        Sube cualquier archivo de video (MP4/MOV) para corrección y análisis biomecánico en tiempo real con IA:
      </p>

      {/* Botones principales INK Pill */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="video/mp4,video/quicktime,video/webm,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn btn-upload"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px 20px',
            background: 'var(--accent-green, #a1ff4f)',
            color: '#000000',
            fontSize: '0.88rem',
            fontWeight: 900,
            borderRadius: '9999px',
            cursor: 'pointer',
            border: '1px solid var(--accent-green, #a1ff4f)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 SUBIR CUALQUIER VIDEO (MP4/MOV)
        </button>
      </div>

      {/* Buscador Rápido */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar ejercicio o demo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '9999px',
            background: '#0a0e11',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
            fontSize: '0.82rem',
            outline: 'none',
            fontFamily: 'var(--font-mono)'
          }}
        />
      </div>

      {/* LISTA DE VIDEOS DE EJEMPLO */}
      <div className="card-title" style={{ fontSize: '0.88rem', color: 'var(--accent-blue, #00f0ff)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🎬 VIDEOS DE EJEMPLO LISTOS</span>
        <span style={{ fontSize: '0.72rem', background: '#22272e', color: 'var(--accent-blue, #00f0ff)', padding: '3px 10px', borderRadius: '9999px', fontWeight: 800 }}>
          {filteredDemos.length}
        </span>
      </div>
      <div className="sequence-list" style={{ marginBottom: '20px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredDemos.map((demo) => (
          <div
            key={demo.id}
            className="sequence-item demo-item"
            style={{
              background: '#181d24',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.25s ease'
            }}
            onClick={() => onSelectExampleVideo(demo)}
          >
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', margin: '0 0 4px 0', fontWeight: 800, textTransform: 'uppercase' }}>
                ▶ {demo.title}
              </h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', margin: 0 }}>{demo.desc}</p>
            </div>
            <span className={`tag tag-${demo.type}`} style={{ fontSize: '0.68rem', padding: '4px 10px', borderRadius: '9999px', fontWeight: 900 }}>
              {demo.type === 'correct' ? 'ÓPTIMO' : 'ALERTA'}
            </span>
          </div>
        ))}
        {filteredDemos.length === 0 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>
            No se encontraron ejemplos
          </div>
        )}
      </div>

      {/* Especificaciones IA */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div className="card-title" style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '6px' }}>🧠 MOTOR BIOMECÁNICO PRO</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Inferencia 60 FPS · 33 landmarks 3D MediaPipe · Filtro de Kalman & EMA adaptativo.
        </div>
      </div>
    </div>
  );
}
