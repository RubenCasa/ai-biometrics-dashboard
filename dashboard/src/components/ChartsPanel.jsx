import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

// ─── Colores globales ────────────────────────────────────────────────────────
const C = {
  green:  '#10b981',
  blue:   '#38bdf8',
  purple: '#a855f7',
  amber:  '#f59e0b',
  red:    '#ef4444',
  pink:   '#ec4899',
  bg:     'rgba(15, 23, 42, 0.80)',
  border: 'rgba(255,255,255,0.08)',
};

// ─── Badge de estado ─────────────────────────────────────────────────────────
function StatusBadge({ value, unit, label, color, sub }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.40)',
      border: `1px solid ${color}33`,
      padding: '16px 18px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: '1rem', marginLeft: '3px', fontWeight: 700, opacity: 0.8 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

// ─── Indicador de calidad visual ─────────────────────────────────────────────
function QualityBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '0.78rem', color, fontWeight: 800 }}>{typeof value === 'number' ? value.toFixed(1) : value}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: '999px',
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ─── Opciones base para Chart.js ──────────────────────────────────────────────
function makeOptions({ yLabel = '', suggestedMin, suggestedMax, unit = '' } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 10 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (v) => `${Number(v).toFixed(0)}${unit}`,
        },
        border: { display: false },
        suggestedMin,
        suggestedMax,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10, weight: '700' },
          boxWidth: 12,
          boxHeight: 3,
          borderRadius: 3,
          padding: 12,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(8, 11, 17, 0.95)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 10,
        titleFont: { family: 'JetBrains Mono', size: 11, weight: '700' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(1)}${unit}`,
        }
      },
    },
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ChartsPanel({ seq }) {
  const [chartTab, setChartTab] = useState('kinematics');
  const [exporting, setExporting] = useState(false);

  const history = seq.history || [];
  const hasRealData = history.length >= 3;
  const N = Math.max(history.length, 20);
  const labels = Array.from({ length: N }, (_, i) => i + 1);

  // ─── Datos de la gráfica 1: Tronco + Cadera ─────────────────────────────
  const { trunkSeries, hipSeries } = useMemo(() => {
    if (hasRealData) {
      return {
        trunkSeries: history.map(h => Number((h.trunkAngle ?? 0).toFixed(1))),
        hipSeries:   history.map(h => Number((h.bodyDY !== undefined ? h.bodyDY * 100 : h.bodyDY ?? 50).toFixed(1))),
      };
    }
    // Fallback animado
    return {
      trunkSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2;
        return Number((8 + Math.sin(t) * (seq.clase === 1 ? 22 : 7)).toFixed(1));
      }),
      hipSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2;
        return Number((55 - Math.sin(t) * 30).toFixed(1));
      }),
    };
  }, [history, hasRealData, seq.clase, labels, N]);

  // ─── Datos de la gráfica 2: Ángulos articulares ─────────────────────────
  const { kneeLSeries, kneeRSeries } = useMemo(() => {
    if (hasRealData) {
      return {
        kneeLSeries: history.map(h => Number((h.kneeL ?? h.kneeAngleL ?? 135).toFixed(1))),
        kneeRSeries: history.map(h => Number((h.kneeR ?? h.kneeAngleR ?? 135).toFixed(1))),
      };
    }
    return {
      kneeLSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2;
        return Number((135 + Math.cos(t) * 45).toFixed(1));
      }),
      kneeRSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2 + 0.15;
        return Number((132 + Math.cos(t) * 43).toFixed(1));
      }),
    };
  }, [history, hasRealData, labels, N]);

  // ─── Estadísticas calculadas ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const allKnee = [...kneeLSeries, ...kneeRSeries];
    const minKnee = Math.min(...allKnee);
    const maxKnee = Math.max(...allKnee);
    const avgKnee = allKnee.reduce((a, b) => a + b, 0) / (allKnee.length || 1);

    const avgTrunk = trunkSeries.reduce((a, b) => a + b, 0) / (trunkSeries.length || 1);
    const maxTrunk = Math.max(...trunkSeries);

    // Índice de estabilidad: 1 - (desviación estándar normalizada)
    const mean = avgKnee;
    const variance = allKnee.reduce((s, v) => s + (v - mean) ** 2, 0) / (allKnee.length || 1);
    const stdDev = Math.sqrt(variance);
    const stability = Math.max(0, Math.min(1, 1 - stdDev / 90));

    const qualityScore = seq.qualityScore ?? (seq.confianza * 100) ?? 0;
    const repCount = seq.repCount ?? 0;
    const exerciseName = seq.exercise || seq.action || seq.nombre || 'Ejercicio';

    return {
      minKnee: Number(minKnee.toFixed(1)),
      maxKnee: Number(maxKnee.toFixed(1)),
      avgKnee: Number(avgKnee.toFixed(1)),
      avgTrunk: Number(avgTrunk.toFixed(1)),
      maxTrunk: Number(maxTrunk.toFixed(1)),
      stability: Number(stability.toFixed(2)),
      qualityScore: Number(qualityScore.toFixed(1)),
      repCount,
      exerciseName,
      frames: history.length,
      rangeOfMotion: Number((maxKnee - minKnee).toFixed(1)),
    };
  }, [kneeLSeries, kneeRSeries, trunkSeries, seq, history.length]);

  // ─── Datasets ────────────────────────────────────────────────────────────
  const kinematicsDataset = {
    labels: labels.slice(0, trunkSeries.length),
    datasets: [
      {
        label: 'Inclinación Tronco (°)',
        data: trunkSeries,
        borderColor: C.amber,
        backgroundColor: `${C.amber}18`,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Orientación Vertical (%)',
        data: hipSeries,
        borderColor: C.blue,
        backgroundColor: `${C.blue}12`,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
        borderDash: [5, 3],
      },
    ],
  };

  const anglesDataset = {
    labels: labels.slice(0, kneeLSeries.length),
    datasets: [
      {
        label: 'Rodilla Izq. (°)',
        data: kneeLSeries,
        borderColor: C.purple,
        backgroundColor: `${C.purple}15`,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Rodilla Der. (°)',
        data: kneeRSeries,
        borderColor: C.pink,
        backgroundColor: `${C.pink}10`,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
        borderDash: [4, 3],
      },
    ],
  };

  // ─── Exportar CSV ────────────────────────────────────────────────────────
  const exportToCSV = () => {
    setExporting(true);
    const exercise = stats.exerciseName.replace(/[^a-zA-Z0-9_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `GIMACIO_${exercise}_${timestamp}.csv`;

    const rows = [
      ['Frame', 'TrunkAngle_deg', 'BodyDY_pct', 'KneeAngle_L_deg', 'KneeAngle_R_deg', 'AvgKnee_deg'],
    ];
    const maxLen = Math.max(trunkSeries.length, kneeLSeries.length);
    for (let i = 0; i < maxLen; i++) {
      const avgK = ((kneeLSeries[i] ?? 0) + (kneeRSeries[i] ?? 0)) / 2;
      rows.push([
        i + 1,
        trunkSeries[i] ?? '',
        hipSeries[i] ?? '',
        kneeLSeries[i] ?? '',
        kneeRSeries[i] ?? '',
        avgK.toFixed(1),
      ]);
    }
    // Agregar resumen al final
    rows.push([]);
    rows.push(['=== RESUMEN ===']);
    rows.push(['Ejercicio', stats.exerciseName]);
    rows.push(['Calidad_AI_Score_%', stats.qualityScore]);
    rows.push(['Repeticiones', stats.repCount]);
    rows.push(['Frames_Analizados', stats.frames]);
    rows.push(['Angulo_Minimo_deg', stats.minKnee]);
    rows.push(['Angulo_Maximo_deg', stats.maxKnee]);
    rows.push(['Angulo_Promedio_deg', stats.avgKnee]);
    rows.push(['Rango_de_Movimiento_deg', stats.rangeOfMotion]);
    rows.push(['Inclinacion_Tronco_Promedio_deg', stats.avgTrunk]);
    rows.push(['Indice_Estabilidad', stats.stability]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setExporting(false), 1200);
  };

  // ─── Estilos reutilizables ───────────────────────────────────────────────
  const tabStyle = (active, color) => ({
    padding: '8px 18px',
    borderRadius: '10px',
    border: active ? `1px solid ${color}` : '1px solid transparent',
    background: active ? `${color}22` : 'transparent',
    color: active ? '#fff' : '#64748b',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-mono, JetBrains Mono)',
  });

  const cardStyle = (borderColor) => ({
    padding: '24px',
    borderRadius: '18px',
    background: C.bg,
    border: `1px solid ${borderColor}33`,
    backdropFilter: 'blur(12px)',
    boxShadow: `0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
  });

  return (
    <div style={{ marginTop: '28px' }}>

      {/* ── Barra de control ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px',
        background: 'rgba(10, 14, 22, 0.70)',
        padding: '12px 18px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Badge de datos en vivo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '8px',
            background: hasRealData ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
            border: `1px solid ${hasRealData ? C.green : '#64748b'}44`,
            marginRight: '8px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: hasRealData ? C.green : '#64748b',
              boxShadow: hasRealData ? `0 0 6px ${C.green}` : 'none',
              display: 'inline-block',
              animation: hasRealData ? 'pulse 1.5s ease infinite' : 'none',
            }} />
            <span style={{ fontSize: '0.73rem', color: hasRealData ? C.green : '#64748b', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
              {hasRealData ? `${history.length} FRAMES REALES` : 'MODO DEMO'}
            </span>
          </div>

          <button style={tabStyle(chartTab === 'kinematics', C.blue)} onClick={() => setChartTab('kinematics')}>
            📈 Cinemática
          </button>
          <button style={tabStyle(chartTab === 'angles', C.purple)} onClick={() => setChartTab('angles')}>
            🦵 Flexión Articular
          </button>
          <button style={tabStyle(chartTab === 'summary', C.green)} onClick={() => setChartTab('summary')}>
            📋 Resumen
          </button>
        </div>

        <button
          onClick={exportToCSV}
          disabled={exporting}
          style={{
            padding: '9px 18px',
            borderRadius: '10px',
            border: `1px solid ${C.green}55`,
            background: exporting
              ? 'rgba(16,185,129,0.05)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(56,189,248,0.12))',
            color: exporting ? '#64748b' : C.green,
            fontSize: '0.80rem',
            fontWeight: 800,
            cursor: exporting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {exporting ? '⏳ GENERANDO...' : '📥 EXPORTAR CSV'}
        </button>
      </div>

      {/* ── PESTAÑA 1: Cinemática ──────────────────────────────────────── */}
      {chartTab === 'kinematics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '18px' }}>

          {/* Gráfica de Tronco + Orientación */}
          <div style={cardStyle(C.blue)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.93rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                  📈 Inclinación del Tronco
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Ángulo hombro-cadera vs orientación corporal en el tiempo
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '8px',
                background: stats.avgTrunk < 15 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: stats.avgTrunk < 15 ? C.green : C.red,
                fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                border: `1px solid ${stats.avgTrunk < 15 ? C.green : C.red}33`,
              }}>
                Prom: {stats.avgTrunk.toFixed(1)}°
              </span>
            </div>
            <div style={{ height: '220px' }}>
              <Line data={kinematicsDataset} options={makeOptions({ suggestedMin: 0, suggestedMax: 90, unit: '°' })} />
            </div>
            {/* Mini referencia */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              {[
                { range: '0-8°', label: 'Excelente', color: C.green },
                { range: '8-20°', label: 'Aceptable', color: C.amber },
                { range: '>20°', label: 'Corregir', color: C.red },
              ].map(z => (
                <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: z.color }} />
                  <span style={{ fontSize: '0.70rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{z.range} {z.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de métricas de postura */}
          <div style={cardStyle(C.amber)}>
            <div style={{ fontSize: '0.93rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              ⚡ Indicadores Posturales en Tiempo Real
            </div>

            <QualityBar label="AI Score de Calidad" value={stats.qualityScore} max={100} color={
              stats.qualityScore >= 80 ? C.green : stats.qualityScore >= 60 ? C.amber : C.red
            } />
            <QualityBar label="Estabilidad del Core (EMA)" value={stats.stability * 100} max={100} color={C.blue} />
            <QualityBar label="Rango de Movimiento (ROM)" value={Math.min(stats.rangeOfMotion, 90)} max={90} color={C.purple} />
            <QualityBar label="Inclinación Tronco (máx.)" value={Math.min(stats.maxTrunk, 45)} max={45} color={C.amber} />

            <div style={{
              marginTop: '18px',
              padding: '14px',
              background: 'rgba(0,0,0,0.30)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>EJERCICIO DETECTADO</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: C.amber, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
                {stats.exerciseName.split('(')[0].trim()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                {stats.repCount} reps · {stats.frames} frames analizados
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PESTAÑA 2: Ángulo Articular ───────────────────────────────── */}
      {chartTab === 'angles' && (
        <div style={cardStyle(C.purple)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '5px' }}>
                🦵 Curva de Flexión Articular — Rodilla Izquierda & Derecha
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '480px' }}>
                MediaPipe Pose calcula el ángulo geométrico entre 3 vectores: cadera → rodilla → tobillo.
                En movimientos óptimos el rango varía entre 90° (flexión máxima) y 170° (extensión).
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(16,185,129,0.12)', border: `1px solid ${C.green}44`,
                fontSize: '0.75rem', fontWeight: 700, color: C.green, fontFamily: 'var(--font-mono)',
              }}>
                Min: {stats.minKnee}°
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(56,189,248,0.12)', border: `1px solid ${C.blue}44`,
                fontSize: '0.75rem', fontWeight: 700, color: C.blue, fontFamily: 'var(--font-mono)',
              }}>
                Max: {stats.maxKnee}°
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(168,85,247,0.12)', border: `1px solid ${C.purple}44`,
                fontSize: '0.75rem', fontWeight: 700, color: C.purple, fontFamily: 'var(--font-mono)',
              }}>
                ROM: {stats.rangeOfMotion}°
              </div>
            </div>
          </div>

          <div style={{ height: '280px' }}>
            <Line data={anglesDataset} options={makeOptions({ suggestedMin: 60, suggestedMax: 185, unit: '°' })} />
          </div>

          {/* Zonas de referencia */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginTop: '18px',
          }}>
            {[
              { label: 'Flexión Profunda', range: '60°–90°', color: C.green, icon: '✅' },
              { label: 'Flexión Media', range: '90°–130°', color: C.amber, icon: '🟡' },
              { label: 'Semi-extendido', range: '130°–165°', color: C.blue, icon: '🔵' },
              { label: 'Extensión Completa', range: '165°–180°', color: C.purple, icon: '⬆' },
            ].map(z => (
              <div key={z.label} style={{
                padding: '10px 14px',
                background: `${z.color}0e`,
                border: `1px solid ${z.color}22`,
                borderRadius: '10px',
              }}>
                <div style={{ fontSize: '0.70rem', color: '#64748b', marginBottom: '3px', fontFamily: 'var(--font-mono)' }}>{z.icon} {z.label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: z.color, fontFamily: 'var(--font-mono)' }}>{z.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PESTAÑA 3: Resumen Estadístico ────────────────────────────── */}
      {chartTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Grid de KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
            <StatusBadge value={stats.minKnee} unit="°" label="Flexión Máxima" color={C.green} sub="Ángulo mínimo alcanzado" />
            <StatusBadge value={stats.maxKnee} unit="°" label="Extensión Máxima" color={C.blue} sub="Ángulo máximo registrado" />
            <StatusBadge value={stats.avgKnee} unit="°" label="Ángulo Promedio" color={C.purple} sub="Media del ciclo completo" />
            <StatusBadge value={stats.rangeOfMotion} unit="°" label="Rango Movimiento" color={C.amber} sub="Amplitud ROM total" />
            <StatusBadge value={stats.stability} unit="" label="Índice Estabilidad" color={C.pink} sub="EMA suavizado 0-1" />
            <StatusBadge value={stats.qualityScore} unit="%" label="AI Score Calidad" color={
              stats.qualityScore >= 80 ? C.green : stats.qualityScore >= 60 ? C.amber : C.red
            } sub="Evaluación biomecánica IA" />
          </div>

          {/* Card de resumen narrativo */}
          <div style={cardStyle(C.green)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                📋 Reporte Técnico Biomecánico
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '8px',
                  background: 'rgba(56,189,248,0.12)', border: `1px solid ${C.blue}44`,
                  fontSize: '0.73rem', fontWeight: 700, color: C.blue, fontFamily: 'var(--font-mono)',
                }}>
                  {stats.frames} frames
                </span>
                <span style={{
                  padding: '4px 12px', borderRadius: '8px',
                  background: 'rgba(168,85,247,0.12)', border: `1px solid ${C.purple}44`,
                  fontSize: '0.73rem', fontWeight: 700, color: C.purple, fontFamily: 'var(--font-mono)',
                }}>
                  {stats.repCount} reps
                </span>
              </div>
            </div>

            {/* Tabla de métricas */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr>
                    {['Métrica', 'Valor', 'Rango Óptimo', 'Estado'].map(h => (
                      <th key={h} style={{
                        padding: '9px 14px', textAlign: 'left',
                        color: '#64748b', fontWeight: 700,
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        fontSize: '0.72rem', letterSpacing: '0.06em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Flexión Máxima (ROM)', value: `${stats.minKnee}°`, optimal: '< 95°', ok: stats.minKnee < 95 },
                    { metric: 'Extensión Máxima', value: `${stats.maxKnee}°`, optimal: '> 155°', ok: stats.maxKnee > 155 },
                    { metric: 'Ángulo Promedio Ciclo', value: `${stats.avgKnee}°`, optimal: '90°–165°', ok: stats.avgKnee >= 90 && stats.avgKnee <= 165 },
                    { metric: 'Inclinación Tronco (prom)', value: `${stats.avgTrunk}°`, optimal: '< 15°', ok: stats.avgTrunk < 15 },
                    { metric: 'Inclinación Tronco (máx)', value: `${stats.maxTrunk}°`, optimal: '< 25°', ok: stats.maxTrunk < 25 },
                    { metric: 'Estabilidad del Core', value: stats.stability.toFixed(2), optimal: '> 0.80', ok: stats.stability > 0.80 },
                    { metric: 'Rango de Movimiento', value: `${stats.rangeOfMotion}°`, optimal: '> 40°', ok: stats.rangeOfMotion > 40 },
                    { metric: 'Calidad AI Score', value: `${stats.qualityScore}%`, optimal: '> 80%', ok: stats.qualityScore > 80 },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.18)' : 'transparent' }}>
                      <td style={{ padding: '9px 14px', color: '#cbd5e1' }}>{row.metric}</td>
                      <td style={{ padding: '9px 14px', color: '#fff', fontWeight: 800 }}>{row.value}</td>
                      <td style={{ padding: '9px 14px', color: '#64748b' }}>{row.optimal}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '6px',
                          background: row.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: row.ok ? C.green : C.red,
                          fontSize: '0.70rem', fontWeight: 800,
                          border: `1px solid ${row.ok ? C.green : C.red}33`,
                        }}>
                          {row.ok ? '✓ ÓPTIMO' : '⚠ MEJORAR'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(16,185,129,0.07)',
              borderRadius: '10px',
              border: '1px solid rgba(16,185,129,0.15)',
              fontSize: '0.80rem',
              color: '#94a3b8',
              lineHeight: 1.65,
            }}>
              <b style={{ color: C.green }}>💡 Para tu reporte académico:</b>{' '}
              Haz clic en <b style={{ color: '#fff' }}>📥 EXPORTAR CSV</b> en la barra superior para descargar todos los datos
              frame por frame. El archivo incluye tronco, cadera, ángulos articulares y el resumen estadístico completo —
              compatible con <b>Excel, Python/Pandas, MATLAB y R</b>.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

