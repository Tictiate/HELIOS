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
  animation: { duration: 300 } as const,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        font: { size: 10, family: 'Inter' },
        boxWidth: 8,
        padding: 8,
        usePointStyle: true,
        pointStyle: 'circle' as const,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { size: 11, family: 'Inter' },
      bodyFont: { size: 10, family: 'Inter' },
      padding: 10,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { size: 9, family: 'Inter' }, maxTicksLimit: 8 },
      grid: { color: 'rgba(148, 163, 184, 0.05)' },
      border: { color: 'rgba(148, 163, 184, 0.1)' },
    },
    y: {
      ticks: { color: '#64748b', font: { size: 9, family: 'Inter' } },
      grid: { color: 'rgba(148, 163, 184, 0.05)' },
      border: { color: 'rgba(148, 163, 184, 0.1)' },
    },
  },
};

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
      }],
    };
  }, [state.healthHistory]);

  return (
    <div className="glass-card-static p-3 h-full flex flex-col">
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Latency vs Time
      </span>
      <div className="chart-container flex-1">
        <Line data={data} options={baseOptions} />
      </div>
    </div>
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
      }],
    };
  }, [state.healthHistory.length, state.towerHistory]);

  return (
    <div className="glass-card-static p-3 h-full flex flex-col">
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Bandwidth vs Time
      </span>
      <div className="chart-container flex-1">
        <Line data={data} options={baseOptions} />
      </div>
    </div>
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
        borderColor: [
          '#a78bfa',
          '#3b82f6',
          '#22d3ee',
          '#fbbf24',
          '#f87171',
        ],
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [state.trafficData]);

  return (
    <div className="glass-card-static p-3 h-full flex flex-col">
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Traffic by Service
      </span>
      <div className="chart-container flex-1">
        <Bar data={data} options={{
          ...baseOptions,
          plugins: { ...baseOptions.plugins, legend: { display: false } },
        }} />
      </div>
    </div>
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
    <div className="glass-card-static p-3 h-full flex flex-col">
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Tower Utilization
      </span>
      <div className="chart-container flex-1">
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
      </div>
    </div>
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
