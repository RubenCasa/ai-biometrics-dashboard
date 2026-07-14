import React from 'react';

export default function FeedbackCard({ seq }) {
  const cardClass =
    seq.clase === 0
      ? 'feedback-correct'
      : seq.clase === 1
      ? 'feedback-back'
      : 'feedback-limb';

  const progressColor =
    seq.clase === 0
      ? 'var(--accent-green)'
      : seq.clase === 1
      ? 'var(--accent-red)'
      : 'var(--accent-amber)';

  const confPercentage = seq.qualityScore !== undefined && seq.qualityScore > 0
    ? seq.qualityScore.toFixed(1)
    : (seq.confianza * 100).toFixed(1);

  const phaseLabel = seq.phase === 'up' ? '⬆ SUBIDA' : seq.phase === 'down' ? '⬇ BAJADA' : '— IDLE';

  return (
    <div className={`feedback-box ${cardClass}`}>
      <div>
        <div className="diag-header">
          <div className="diag-title">{seq.nombre}</div>
          <span className="tag" style={{ border: `1px solid ${progressColor}`, color: progressColor }}>
            CLASE {seq.clase}
          </span>
        </div>

        {/* Barra de calidad */}
        <div className="confidence-meter">
          <div className="confidence-label">
            <span>Calidad Postural</span>
            <span>{confPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${confPercentage}%`, background: progressColor }}
            />
          </div>
        </div>

        {/* Indicadores adicionales */}
        {seq.isUserVideo && (
          <div className="live-indicators">
            {seq.repCount > 0 && (
              <div className="indicator-chip">
                <span className="chip-label">🔄 Reps</span>
                <span className="chip-value">{seq.repCount}</span>
              </div>
            )}
            <div className="indicator-chip">
              <span className="chip-label">📐 Fase</span>
              <span className="chip-value">{phaseLabel}</span>
            </div>
            <div className="indicator-chip">
              <span className="chip-label">🎯 Confianza IA</span>
              <span className="chip-value">{(seq.confianza * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          📢 Retroalimentación Inteligente (IA en Español)
        </div>
        <div className="feedback-message" style={{ borderColor: progressColor }}>
          {seq.feedback}
        </div>
      </div>
    </div>
  );
}
