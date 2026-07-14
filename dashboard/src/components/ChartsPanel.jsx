import React from 'react';
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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsPanel({ seq }) {
  const labels = Array.from({ length: 46 }, (_, i) => i + 1);

  // Evolución de inclinación del tronco adaptada a la secuencia actual
  const trunkData = labels.map(i => {
    const t = (i / 46) * Math.PI * 2;
    let base = 8 + Math.sin(t) * 6;
    if (seq.clase === 1) base += Math.max(0, Math.sin(t) * 18);
    return Number(base.toFixed(1));
  });

  // Profundidad de cadera Y
  const depthData = labels.map(i => {
    const t = (i / 46) * Math.PI * 2;
    return Number((210 - Math.sin(t) * 55).toFixed(1));
  });

  const chartColor =
    seq.clase === 0
      ? '#10b981'
      : seq.clase === 1
      ? '#ef4444'
      : '#f59e0b';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const trunkDataset = {
    labels,
    datasets: [
      {
        data: trunkData,
        borderColor: chartColor,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.35
      }
    ]
  };

  const depthDataset = {
    labels,
    datasets: [
      {
        data: depthData,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.35
      }
    ]
  };

  return (
    <div className="charts-grid">
      <div className="card">
        <div className="card-title">📈 Evolución de Inclinación del Tronco (Hombro - Cadera)</div>
        <div className="chart-wrapper">
          <Line data={trunkDataset} options={commonOptions} />
        </div>
      </div>
      <div className="card">
        <div className="card-title">📉 Trayectoria de Profundidad Vertical (Centro de Cadera Y)</div>
        <div className="chart-wrapper">
          <Line data={depthDataset} options={commonOptions} />
        </div>
      </div>
    </div>
  );
}
