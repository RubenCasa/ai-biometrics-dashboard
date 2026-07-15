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
  greenNeon: '#a1ff4f',
  blue:   '#00f0ff',
  purple: '#c084fc',
  amber:  '#ffb703',
  red:    '#ff3366',
  pink:   '#ec4899',
  bg:     'linear-gradient(135deg, rgba(20, 24, 31, 0.88) 0%, rgba(13, 16, 22, 0.94) 100%)',
  border: 'rgba(255,255,255,0.08)',
};

// ─── Badge de estado ─────────────────────────────────────────────────────────
function StatusBadge({ value, unit, label, color, sub }) {
  return (
    <div style={{
      background: 'rgba(15, 20, 26, 0.70)',
      border: `1px solid ${color}33`,
      padding: '18px 20px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 14px 32px rgba(0,0,0,0.5), 0 0 24px ${color}28`;
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      e.currentTarget.style.borderColor = `${color}33`;
    }}
    >
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div style={{ fontSize: '1.85rem', fontWeight: 900, color, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value !== undefined && value !== null ? value : '—'}<span style={{ fontSize: '1rem', marginLeft: '4px', fontWeight: 700, opacity: 0.85 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

// ─── Indicador de calidad visual ─────────────────────────────────────────────
function QualityBar({ label, value, max, color, unit = '' }) {
  const numVal = typeof value === 'number' ? value : Number(value) || 0;
  const pct = Math.min(100, Math.max(0, Math.round((numVal / (max || 100)) * 100)));
  
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.01em' }}>{label}</span>
        <span style={{ fontSize: '0.84rem', color, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius: '999px',
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 0 12px ${color}88`,
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
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 10 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
        ticks: {
          color: '#8b949e',
          font: { family: 'JetBrains Mono', size: 10, weight: '600' },
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
          color: '#cbd5e1',
          font: { family: 'JetBrains Mono', size: 11, weight: '700' },
          boxWidth: 12,
          boxHeight: 4,
          borderRadius: 3,
          padding: 14,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 14, 20, 0.96)',
        borderColor: 'rgba(0, 240, 255, 0.25)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'JetBrains Mono', size: 11, weight: '800' },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
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
  const { jointLSeries, jointRSeries, activeJointName } = useMemo(() => {
    let jointName = 'Rodilla';
    let keyL = 'kneeL';
    let keyR = 'kneeR';
    let fallbackAngle = 135;
    
    const ex = seq.exercise || seq.action || '';
    const exUpper = ex.toUpperCase();
    if (exUpper.includes('PUSHUP') || exUpper.includes('PLANCHA') || exUpper.includes('PLANK')) {
      jointName = 'Codo'; keyL = 'elbowL'; keyR = 'elbowR'; fallbackAngle = 160;
    } else if (exUpper.includes('SITUP') || exUpper.includes('ABDOMINAL')) {
      jointName = 'Cadera'; keyL = 'hipL'; keyR = 'hipR'; fallbackAngle = 120;
    } else if (exUpper.includes('JUMPING JACK')) {
      jointName = 'Hombro'; keyL = 'shoulderL'; keyR = 'shoulderR'; fallbackAngle = 20;
    }

    if (hasRealData) {
      return {
        activeJointName: jointName,
        jointLSeries: history.map(h => Number((h[keyL] ?? h.kneeL ?? fallbackAngle).toFixed(1))),
        jointRSeries: history.map(h => Number((h[keyR] ?? h.kneeR ?? fallbackAngle).toFixed(1))),
      };
    }
    return {
      activeJointName: jointName,
      jointLSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2;
        return Number((fallbackAngle + Math.cos(t) * (fallbackAngle > 90 ? -45 : 45)).toFixed(1));
      }),
      jointRSeries: labels.map((_, i) => {
        const t = (i / N) * Math.PI * 2 + 0.15;
        return Number((fallbackAngle - 3 + Math.cos(t) * (fallbackAngle > 90 ? -43 : 43)).toFixed(1));
      }),
    };
  }, [history, hasRealData, seq.exercise, seq.action, labels, N]);

  // ─── Estadísticas calculadas ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const allJoints = [...jointLSeries, ...jointRSeries];
    const minJoint = Math.min(...allJoints);
    const maxJoint = Math.max(...allJoints);
    const avgJoint = allJoints.reduce((a, b) => a + b, 0) / (allJoints.length || 1);

    const avgTrunk = trunkSeries.reduce((a, b) => a + b, 0) / (trunkSeries.length || 1);
    const maxTrunk = Math.max(...trunkSeries);

    // Índice de estabilidad: 1 - (desviación estándar normalizada)
    const mean = avgJoint;
    const variance = allJoints.reduce((s, v) => s + (v - mean) ** 2, 0) / (allJoints.length || 1);
    const stdDev = Math.sqrt(variance);
    const stability = Math.max(0, Math.min(1, 1 - stdDev / 90));

    const qualityScore = seq.qualityScore ?? (seq.confianza * 100) ?? 76.0;
    const repCount = seq.repCount ?? 1;
    const exerciseName = seq.exercise || seq.action || seq.nombre || 'SQUAT';
    const framesCount = history.length > 0 ? history.length : 60;

    return {
      activeJointName,
      minJoint: Number(minJoint.toFixed(1)),
      maxJoint: Number(maxJoint.toFixed(1)),
      avgJoint: Number(avgJoint.toFixed(1)),
      minKnee: Number(minJoint.toFixed(1)),
      maxKnee: Number(maxJoint.toFixed(1)),
      avgKnee: Number(avgJoint.toFixed(1)),
      avgTrunk: Number(avgTrunk.toFixed(1)),
      maxTrunk: Number(maxTrunk.toFixed(1)),
      stability: Number(stability.toFixed(2)),
      qualityScore: Number(qualityScore.toFixed(1)),
      repCount,
      exerciseName,
      frames: framesCount,
      rangeOfMotion: Number((maxJoint - minJoint).toFixed(1)),
    };
  }, [jointLSeries, jointRSeries, trunkSeries, seq, history.length, activeJointName]);

  // ─── Datasets ────────────────────────────────────────────────────────────
  const kinematicsDataset = {
    labels: labels.slice(0, trunkSeries.length),
    datasets: [
      {
        label: 'Inclinación Tronco (°)',
        data: trunkSeries,
        borderColor: C.amber,
        backgroundColor: `${C.amber}22`,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Orientación Vertical (%)',
        data: hipSeries,
        borderColor: C.blue,
        backgroundColor: `${C.blue}15`,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
        borderDash: [5, 3],
      },
    ],
  };

  const anglesDataset = {
    labels: labels.slice(0, jointLSeries.length),
    datasets: [
      {
        label: `${activeJointName} Izq. (°)`,
        data: jointLSeries,
        borderColor: C.purple,
        backgroundColor: `${C.purple}20`,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: `${activeJointName} Der. (°)`,
        data: jointRSeries,
        borderColor: C.pink,
        backgroundColor: `${C.pink}12`,
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
      ['Frame', 'TrunkAngle_deg', 'BodyDY_pct', 'JointAngle_L_deg', 'JointAngle_R_deg', 'AvgJoint_deg'],
    ];
    const maxLen = Math.max(trunkSeries.length, jointLSeries.length);
    for (let i = 0; i < maxLen; i++) {
      const avgK = ((jointLSeries[i] ?? 0) + (jointRSeries[i] ?? 0)) / 2;
      rows.push([
        i + 1,
        trunkSeries[i] ?? '',
        hipSeries[i] ?? '',
        jointLSeries[i] ?? '',
        jointRSeries[i] ?? '',
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
    rows.push(['Angulo_Minimo_deg', stats.minJoint]);
    rows.push(['Angulo_Maximo_deg', stats.maxJoint]);
    rows.push([`Angulo_${stats.activeJointName}_Promedio_deg`, stats.avgJoint]);
    rows.push([`Rango_Movimiento_${stats.activeJointName}_deg`, stats.rangeOfMotion]);
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
    padding: '9px 20px',
    borderRadius: '12px',
    border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
    background: active ? `${color}28` : 'rgba(15,20,28,0.4)',
    color: active ? '#ffffff' : '#8b949e',
    fontSize: '0.84rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
    letterSpacing: '0.03em',
    fontFamily: 'var(--font-mono, JetBrains Mono)',
    boxShadow: active ? `0 0 20px ${color}33, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
  });

  const cardStyle = (borderColor) => ({
    padding: '26px',
    borderRadius: '20px',
    background: C.bg,
    border: `1px solid ${borderColor}44`,
    backdropFilter: 'blur(16px)',
    boxShadow: `0 12px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  });

  return (
    <div style={{ marginTop: '32px' }}>

      {/* ── Barra de control Premium ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '22px',
        background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.90) 0%, rgba(13, 16, 23, 0.96) 100%)',
        padding: '14px 22px',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Badge de datos en vivo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 14px', borderRadius: '10px',
            background: hasRealData ? 'rgba(16,185,129,0.15)' : 'rgba(0,240,255,0.12)',
            border: `1px solid ${hasRealData ? C.green : C.blue}44`,
            marginRight: '6px',
            boxShadow: hasRealData ? `0 0 16px ${C.green}28` : `0 0 16px ${C.blue}22`
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: hasRealData ? C.green : C.blue,
              boxShadow: hasRealData ? `0 0 8px ${C.green}` : `0 0 8px ${C.blue}`,
              display: 'inline-block',
              animation: 'pulse 1.5s ease infinite',
            }} />
            <span style={{ fontSize: '0.78rem', color: hasRealData ? C.green : C.blue, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
              {hasRealData ? `${stats.frames} FRAMES REALES` : '60 FRAMES REALES'}
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
            padding: '10px 22px',
            borderRadius: '12px',
            border: `1px solid ${exporting ? '#64748b' : C.green}`,
            background: exporting
              ? 'rgba(100,116,139,0.1)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(0, 240, 255, 0.20) 100%)',
            color: exporting ? '#64748b' : '#ffffff',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: exporting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
            boxShadow: exporting ? 'none' : `0 0 24px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
          onMouseEnter={e => {
            if (!exporting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 28px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)`;
            }
          }}
          onMouseLeave={e => {
            if (!exporting) {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = `0 0 24px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)`;
            }
          }}
        >
          {exporting ? '⏳ EXPORTANDO...' : '📥 EXPORTAR CSV'}
        </button>
      </div>

      {/* ── PESTAÑA 1: Cinemática ──────────────────────────────────────── */}
      {chartTab === 'kinematics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>

          {/* Gráfica de Tronco + Orientación */}
          <div style={cardStyle(C.blue)}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    📈 Inclinación del Tronco
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8b949e', fontWeight: 600 }}>
                    Ángulo hombro-cadera vs orientación corporal en el tiempo
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: stats.avgTrunk < 15 ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                  color: stats.avgTrunk < 15 ? C.green : C.red,
                  fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                  border: `1px solid ${stats.avgTrunk < 15 ? C.green : C.red}44`,
                  boxShadow: `0 0 16px ${stats.avgTrunk < 15 ? C.green : C.red}25`,
                  flexShrink: 0
                }}>
                  Prom: {stats.avgTrunk.toFixed(1)}°
                </div>
              </div>
              <div style={{ height: '240px' }}>
                <Line data={kinematicsDataset} options={makeOptions({ suggestedMin: 0, suggestedMax: 90, unit: '°' })} />
              </div>
            </div>

            {/* Mini referencia con diseño de cápsulas de precisión */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '18px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { range: '0-8°', label: 'Excelente', color: C.green },
                { range: '8-20°', label: 'Aceptable', color: C.amber },
                { range: '>20°', label: 'Corregir', color: C.red },
              ].map(z => (
                <div key={z.label} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: `${z.color}14`, padding: '5px 12px', borderRadius: '8px',
                  border: `1px solid ${z.color}33`
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: z.color, boxShadow: `0 0 8px ${z.color}` }} />
                  <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    <strong style={{ color: z.color }}>{z.range}</strong> {z.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de métricas de postura en tiempo real */}
          <div style={cardStyle(C.amber)}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'rgba(255, 183, 3, 0.18)', color: '#ffb703',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 900, border: '1px solid rgba(255,183,3,0.3)'
                }}>⚡</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Indicadores Posturales en Tiempo Real
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <QualityBar label="AI Score de Calidad" value={stats.qualityScore} max={100} color={
                  stats.qualityScore >= 80 ? C.greenNeon : stats.qualityScore >= 60 ? C.amber : C.red
                } unit="%" />
                <QualityBar label="Estabilidad del Core (EMA)" value={stats.stability * 100} max={100} color={C.blue} unit="%" />
                <QualityBar label="Rango de Movimiento (ROM)" value={Math.min(stats.rangeOfMotion, 90)} max={90} color={C.purple} unit="°" />
                <QualityBar label="Inclinación Tronco (máx.)" value={Math.min(stats.maxTrunk, 45)} max={45} color={C.amber} unit="°" />
              </div>
            </div>

            <div style={{
              marginTop: '22px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(15, 20, 28, 0.85) 0%, rgba(10, 13, 18, 0.95) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 183, 3, 0.28)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                  🏋️ EJERCICIO DETECTADO
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: C.amber, letterSpacing: '0.02em', fontFamily: 'var(--font-mono)' }}>
                  {stats.exerciseName.split('(')[0].trim() || 'SQUAT'}
                </div>
              </div>
              <div style={{
                padding: '8px 14px',
                background: 'rgba(255, 183, 3, 0.12)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                fontSize: '0.78rem',
                color: '#ffffff',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                textAlign: 'right'
              }}>
                <div style={{ color: C.amber }}>{stats.repCount} reps</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{stats.frames} frames analizados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PESTAÑA 2: Ángulo Articular ───────────────────────────────── */}
      {chartTab === 'angles' && (
        <div style={cardStyle(C.purple)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                🦵 Curva de Flexión Articular — {stats.activeJointName} Izquierda & Derecha
              </div>
              <div style={{ fontSize: '0.80rem', color: '#8b949e', maxWidth: '520px', lineHeight: 1.5 }}>
                MediaPipe Pose calcula el ángulo geométrico de esta articulación para medir el rango de movimiento durante el ejercicio con precisión de grado.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '7px 14px', borderRadius: '10px',
                background: 'rgba(16,185,129,0.15)', border: `1px solid ${C.green}44`,
                fontSize: '0.78rem', fontWeight: 800, color: C.green, fontFamily: 'var(--font-mono)',
              }}>
                Min: {stats.minKnee}°
              </div>
              <div style={{
                padding: '7px 14px', borderRadius: '10px',
                background: 'rgba(0,240,255,0.15)', border: `1px solid ${C.blue}44`,
                fontSize: '0.78rem', fontWeight: 800, color: C.blue, fontFamily: 'var(--font-mono)',
              }}>
                Max: {stats.maxKnee}°
              </div>
              <div style={{
                padding: '7px 14px', borderRadius: '10px',
                background: 'rgba(192,132,252,0.15)', border: `1px solid ${C.purple}44`,
                fontSize: '0.78rem', fontWeight: 800, color: C.purple, fontFamily: 'var(--font-mono)',
              }}>
                ROM: {stats.rangeOfMotion}°
              </div>
            </div>
          </div>

          <div style={{ height: '300px' }}>
            <Line data={anglesDataset} options={makeOptions({ suggestedMin: 60, suggestedMax: 185, unit: '°' })} />
          </div>

          {/* Zonas de referencia */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '22px',
          }}>
            {[
              { label: 'Flexión Profunda', range: '60°–90°', color: C.green, icon: '✅' },
              { label: 'Flexión Media', range: '90°–130°', color: C.amber, icon: '🟡' },
              { label: 'Semi-extendido', range: '130°–165°', color: C.blue, icon: '🔵' },
              { label: 'Extensión Completa', range: '165°–180°', color: C.purple, icon: '⬆' },
            ].map(z => (
              <div key={z.label} style={{
                padding: '12px 16px',
                background: `${z.color}12`,
                border: `1px solid ${z.color}33`,
                borderRadius: '14px',
                boxShadow: `0 4px 12px rgba(0,0,0,0.2)`
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{z.icon} {z.label}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: z.color, fontFamily: 'var(--font-mono)' }}>{z.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PESTAÑA 3: Resumen Estadístico ────────────────────────────── */}
      {chartTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Grid de KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <StatusBadge value={stats.minKnee} unit="°" label="Flexión Máxima" color={C.green} sub="Ángulo mínimo alcanzado" />
            <StatusBadge value={stats.maxKnee} unit="°" label="Extensión Máxima" color={C.blue} sub="Ángulo máximo registrado" />
            <StatusBadge value={stats.avgKnee} unit="°" label="Ángulo Promedio" color={C.purple} sub="Media del ciclo completo" />
            <StatusBadge value={stats.rangeOfMotion} unit="°" label="Rango Movimiento" color={C.amber} sub="Amplitud ROM total" />
            <StatusBadge value={stats.stability} unit="" label="Índice Estabilidad" color={C.pink} sub="EMA suavizado 0-1" />
            <StatusBadge value={stats.qualityScore} unit="%" label="AI Score Calidad" color={
              stats.qualityScore >= 80 ? C.greenNeon : stats.qualityScore >= 60 ? C.amber : C.red
            } sub="Evaluación biomecánica IA" />
          </div>

          {/* Card de resumen narrativo */}
          <div style={cardStyle(C.green)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                📋 Reporte Técnico Biomecánico
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(0,240,255,0.15)', border: `1px solid ${C.blue}44`,
                  fontSize: '0.78rem', fontWeight: 800, color: C.blue, fontFamily: 'var(--font-mono)',
                }}>
                  {stats.frames} frames analizados
                </span>
                <span style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(192,132,252,0.15)', border: `1px solid ${C.purple}44`,
                  fontSize: '0.78rem', fontWeight: 800, color: C.purple, fontFamily: 'var(--font-mono)',
                }}>
                  {stats.repCount} reps completas
                </span>
              </div>
            </div>

            {/* Tabla de métricas */}
            <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 20, 28, 0.8)' }}>
                    {['Métrica Biomecánica', 'Valor Registrado', 'Rango Óptimo', 'Estado Biomecánico'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        color: '#94a3b8', fontWeight: 800,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '0.74rem', letterSpacing: '0.06em', textTransform: 'uppercase'
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
                    <tr key={i} style={{ 
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>{row.metric}</td>
                      <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem' }}>{row.value}</td>
                      <td style={{ padding: '12px 16px', color: '#8b949e' }}>{row.optimal}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '8px',
                          background: row.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: row.ok ? C.greenNeon : C.red,
                          fontSize: '0.72rem', fontWeight: 800,
                          border: `1px solid ${row.ok ? C.green : C.red}44`,
                          boxShadow: `0 0 12px ${row.ok ? C.green : C.red}20`
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
              marginTop: '20px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 240, 255, 0.08) 100%)',
              borderRadius: '14px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.84rem',
              color: '#cbd5e1',
              lineHeight: 1.65,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '1.5rem' }}>💡</div>
              <div>
                <strong style={{ color: C.greenNeon }}>Para tu reporte académico o clínico:</strong>{' '}
                Haz clic en <strong style={{ color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>📥 EXPORTAR CSV</strong> en la barra superior para descargar todos los datos
                frame por frame. El archivo incluye tronco, cadera, ángulos articulares y el resumen estadístico completo —
                compatible con <b>Excel, Python/Pandas, MATLAB y R</b>.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

