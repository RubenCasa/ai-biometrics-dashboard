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

  // Filtrar videos de ejemplo según la búsqueda
  const filteredDemos = EXAMPLE_VIDEOS.filter(demo =>
    demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="card sidebar-card" style={{
      borderRadius: '18px',
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.82)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      color: '#ffffff'
    }}>
      <div className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
        ⚡ Panel de Control Biomecánico
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
        Activa tu cámara web o elige un video de prueba para comenzar la inferencia IA:
      </p>

      {/* Botones principales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        <button
          className="btn btn-webcam"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            border: '1px solid #38bdf8',
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onClick={onStartWebcam}
        >
          📹 INICIAR CÁMARA WEB EN VIVO
        </button>

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
            padding: '13px',
            background: 'linear-gradient(135deg, #10b981, #38bdf8)',
            color: '#000',
            fontSize: '0.88rem',
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            border: 'none',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 SUBIR CUALQUIER VIDEO (MP4/MOV)
        </button>
      </div>

      {/* Buscador Rápido */}
      <div style={{ marginBottom: '18px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar ejercicio o código (ej. Squat, #1659)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            fontSize: '0.82rem',
            outline: 'none',
            fontFamily: 'var(--font-mono)'
          }}
        />
      </div>

      {/* LISTA DE VIDEOS DE EJEMPLO */}
      <div className="card-title" style={{ fontSize: '0.88rem', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🎬 Videos de Ejemplo listos</span>
        <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
          {filteredDemos.length}
        </span>
      </div>
      <div className="sequence-list" style={{ marginBottom: '20px', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredDemos.map((demo) => (
          <div
            key={demo.id}
            className="sequence-item demo-item"
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s ease'
            }}
            onClick={() => onSelectExampleVideo(demo)}
          >
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', margin: '0 0 3px 0', fontWeight: 700 }}>
                ▶ {demo.title}
              </h4>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{demo.desc}</p>
            </div>
            <span className={`tag tag-${demo.type}`} style={{ fontSize: '0.68rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 800 }}>
              {demo.type === 'correct' ? 'ÓPTIMO' : 'ALERTA'}
            </span>
          </div>
        ))}
        {filteredDemos.length === 0 && (
          <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', padding: '12px' }}>
            No se encontraron ejemplos
          </div>
        )}
      </div>


      {/* Especificaciones IA */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="card-title" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>🧠 Motor Biomecánico</div>
        <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          Inferencia en tiempo real 60 FPS · 33 landmarks 3D MediaPipe · Filtro de Kalman & EMA adaptativo.
        </div>
      </div>
    </div>
  );
}
