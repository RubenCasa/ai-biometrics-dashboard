import React, { useRef } from 'react';

export default function Sidebar({ sequences, currentSeqIdx, onSelectSeq, onLoadDemoVideo, onUploadVideo, onStartWebcam }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVideo(file);
    }
  };

  return (
    <div className="card sidebar-card">
      <div className="card-title">📁 Panel de Control</div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
        Selecciona una fuente de video para análisis biomecánico en tiempo real:
      </p>

      {/* Botones de acción principales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        <button
          className="btn btn-webcam"
          style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          onClick={onStartWebcam}
        >
          📹 USAR MI CÁMARA WEB
        </button>

        <button
          className="btn btn-demo"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          onClick={onLoadDemoVideo}
        >
          🎬 VIDEO DEMO (MP4)
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="video/mp4,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn btn-upload"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 SUBIR MI VIDEO (MP4)
        </button>
      </div>

      {/* Lista de secuencias */}
      <div className="card-title" style={{ fontSize: '0.9rem', marginTop: '4px' }}>📋 Historial de Sesiones</div>
      <div className="sequence-list">
        {sequences.map((seq, idx) => (
          <div
            key={seq.id + idx}
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
        <div className="card-title" style={{ fontSize: '0.95rem' }}>🧠 Tecnología</div>
        <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>• <b>Detección:</b> MediaPipe Pose 33 Landmarks</li>
          <li>• <b>Análisis:</b> Ángulos biomecánicos normalizados</li>
          <li>• <b>Suavizado:</b> EMA temporal + voto mayoritario</li>
          <li>• <b>Ejercicios:</b> Squat, Pushup, Situp, Lunge, Deadlift +</li>
          <li>• <b>Features:</b> Conteo de reps, score de calidad 0-100%</li>
        </ul>
      </div>
    </div>
  );
}
