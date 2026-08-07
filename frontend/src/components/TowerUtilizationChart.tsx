import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSimulation } from '../context/SimulationContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300, easing: 'easeOutQuart' } as const,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        font: { size: 10, family: 'Inter', weight: 500 as const },
        boxWidth: 7,
        boxHeight: 7,
        padding: 10,
        usePointStyle: true,
        pointStyle: 'circle' as const,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10, 16, 32, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      cornerRadius: 10,
      titleFont: { size: 11, family: 'Inter', weight: 600 as const },
      bodyFont: { size: 10, family: 'Inter' },
      padding: 10,
      boxPadding: 4,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { size: 9, family: 'Inter' }, maxTicksLimit: 8 },
      grid: { color: 'rgba(148, 163, 184, 0.04)' },
      border: { color: 'rgba(148, 163, 184, 0.08)' },
    },
    y: {
      ticks: { color: '#64748b', font: { size: 9, family: 'Inter' } },
      grid: { color: 'rgba(148, 163, 184, 0.04)' },
      border: { display: false },
    },
  },
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass-card p-3 h-full flex flex-col">
    <span className="label-caps" style={{ marginBottom: '10px', flexShrink: 0 }}>
      {title}
    </span>
    <div className="chart-container flex-1">{children}</div>
  </div>
);

const TowerUtilizationChart: React.FC = () => {
  const { state } = useSimulation();
  const data = useMemo(() => {
    const colors = ['#22d3ee', '#3b82f6', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#e879f9', '#6366f1', '#14b8a6'];
    const datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      tension: number;
      pointRadius: number;
    }[] = [];
    const labels: string[] = [];

    let maxLen = 0;
    state.towerHistory.forEach((arr) => { if (arr.length > maxLen) maxLen = arr.length; });
    for (let i = 0; i < maxLen; i++) labels.push(`${i}`);

    let colorIdx = 0;
    state.towerHistory.forEach((arr, towerId) => {
      const color = colors[colorIdx % colors.length];
      datasets.push({
        label: towerId,
        data: arr.map((t) => Math.min(100, 100 - t.available_bandwidth_mbps)),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 0,
      });
      colorIdx++;
    });

    return { labels, datasets };
  }, [state.towerHistory]);

  return (
    <ChartCard title="Tower Utilization">
      <Line data={data} options={{
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            labels: { ...baseOptions.plugins.legend.labels, font: { size: 8, family: 'Inter' }, boxWidth: 6, padding: 4 },
          },
        },
      }} />
    </ChartCard>
  );
};

export default TowerUtilizationChart;
