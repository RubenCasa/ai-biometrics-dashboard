import React, { useRef } from 'react';
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVideo(file);
    }
  };

  return (
    <div className="card sidebar-card">
      <div className="card-title">⚡ Análisis en Tiempo Real</div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
        Selecciona una fuente en vivo o prueba con nuestros videos de ejemplo listos:
      </p>

      {/* Botones de acción principales para CUALQUIER VIDEO O CÁMARA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
        <button
          className="btn btn-webcam"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.9rem', fontWeight: 800 }}
          onClick={onStartWebcam}
        >
          📹 USAR MI CÁMARA WEB EN VIVO
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
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 SUBIR CUALQUIER VIDEO (MP4/MOV)
        </button>
      </div>

      {/* LISTA DE VIDEOS DE EJEMPLO */}
      <div className="card-title" style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        🎬 Videos de Ejemplo (Predicción IA)
      </div>
      <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
        Haz clic en cualquiera para probar cómo MediaPipe predice ángulos, repeticiones y postura en vivo:
      </p>
      <div className="sequence-list" style={{ marginBottom: '22px' }}>
        {EXAMPLE_VIDEOS.map((demo) => (
          <div
            key={demo.id}
            className="sequence-item demo-item"
            style={{
              background: 'rgba(56, 189, 248, 0.05)',
              borderColor: 'rgba(56, 189, 248, 0.2)'
            }}
            onClick={() => onSelectExampleVideo(demo)}
          >
            <div className="sequence-info">
              <h4 style={{ color: '#ffffff', fontSize: '0.88rem' }}>
                ▶ {demo.title}
              </h4>
              <p style={{ fontSize: '0.74rem' }}>{demo.desc}</p>
            </div>
            <span className={`tag tag-${demo.type}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
              PROBAR
            </span>
          </div>
        ))}
      </div>

      {/* HISTORIAL / BASE DE DATOS PENN ACTION */}
      <div className="card-title" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
        📋 Dataset Penn Action & Historial
      </div>
      <div className="sequence-list">
        {sequences.map((seq, idx) => (
          <div
            key={seq.id + '-' + idx}
            className={`sequence-item ${idx === currentSeqIdx ? 'active' : ''}`}
            onClick={() => onSelectSeq(idx)}
          >
            <div className="sequence-info">
              <h4>
                {seq.isUserVideo
                  ? (seq.id === 'WEBCAM' ? '📹' : '🎬')
                  : '📊'} #{seq.id} — {seq.action}
              </h4>
              <p>{seq.nombre}</p>
            </div>
            <span className={`tag tag-${seq.type}`}>
              {seq.clase === 0 ? 'OK' : `ERR ${seq.clase}`}
            </span>
          </div>
        ))}
      </div>

      {/* Especificaciones IA */}
      <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
        <div className="card-title" style={{ fontSize: '0.95rem' }}>🧠 Especificaciones</div>
        <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>• <b>Inferencia:</b> MediaPipe Pose 33 Landmarks</li>
          <li>• <b>Predicción en Vivo:</b> Ángulos biomecánicos normalizados</li>
          <li>• <b>Conteo de Reps:</b> Fases excéntrica/concéntrica + EMA</li>
          <li>• <b>Soporte:</b> Sentadillas, Flexiones, Press Banca, Abdominales y videos personalizados</li>
        </ul>
      </div>
    </div>
  );
}
