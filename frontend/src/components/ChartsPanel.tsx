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
import { Line, Bar } from 'react-chartjs-2';
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

const LatencyChart: React.FC = () => {
  const { state } = useSimulation();
  const data = useMemo(() => {
    const labels = state.healthHistory.map((_, i) => `${i}`);
    return {
      labels,
      datasets: [{
        label: 'Latency (ms)',
        data: state.healthHistory.map((h) => h.latency_ms),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#22d3ee',
        pointHoverBorderColor: '#f1f5f9',
        pointHoverBorderWidth: 2,
      }],
    };
  }, [state.healthHistory]);

  return (
    <ChartCard title="Latency vs Time">
      <Line data={data} options={baseOptions} />
    </ChartCard>
  );
};

const BandwidthChart: React.FC = () => {
  const { state } = useSimulation();
  const data = useMemo(() => {
    // Average bandwidth across all towers per history tick
    const points: number[] = [];
    const labels: string[] = [];
    const hLen = state.healthHistory.length;
    for (let i = 0; i < hLen; i++) {
      let sum = 0, count = 0;
      state.towerHistory.forEach((arr) => {
        if (arr[i]) { sum += arr[i].available_bandwidth_mbps; count++; }
      });
      points.push(count > 0 ? sum / count : 0);
      labels.push(`${i}`);
    }
    return {
      labels,
      datasets: [{
        label: 'Avg Bandwidth (Mbps)',
        data: points,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#a78bfa',
        pointHoverBorderColor: '#f1f5f9',
        pointHoverBorderWidth: 2,
      }],
    };
  }, [state.healthHistory.length, state.towerHistory]);

  return (
    <ChartCard title="Bandwidth vs Time">
      <Line data={data} options={baseOptions} />
    </ChartCard>
  );
};

const TrafficServiceChart: React.FC = () => {
  const { state } = useSimulation();
  const data = useMemo(() => {
    // Aggregate traffic by service type for current tick
    let video = 0, voice = 0, iot = 0, gaming = 0, emergency = 0;
    state.trafficData.forEach((t) => {
      video += t.video_users;
      voice += t.voice_users;
      iot += t.iot_devices;
      gaming += t.gaming_users;
      emergency += t.emergency_users;
    });
    return {
      labels: ['Video', 'Voice', 'IoT', 'Gaming', 'Emergency'],
      datasets: [{
        label: 'Traffic',
        data: [video, voice, iot, gaming, emergency],
        backgroundColor: [
          'rgba(167, 139, 250, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 211, 238, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(248, 113, 113, 0.7)',
        ],
        hoverBackgroundColor: [
          'rgba(167, 139, 250, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(34, 211, 238, 0.9)',
          'rgba(251, 191, 36, 0.9)',
          'rgba(248, 113, 113, 0.9)',
        ],
        borderColor: [
          '#a78bfa',
          '#3b82f6',
          '#22d3ee',
          '#fbbf24',
          '#f87171',
        ],
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false as const,
      }],
    };
  }, [state.trafficData]);

  return (
    <ChartCard title="Traffic by Service">
      <Bar data={data} options={{
        ...baseOptions,
        plugins: { ...baseOptions.plugins, legend: { display: false } },
      }} />
    </ChartCard>
  );
};

const TowerUtilChart: React.FC = () => {
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

const ChartsPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      <LatencyChart />
      <BandwidthChart />
      <TrafficServiceChart />
      <TowerUtilChart />
    </div>
  );
};

export default ChartsPanel;
