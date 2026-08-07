import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import KPIPanel from './components/KPIPanel';
import HealthGauge from './components/HealthGauge';
import NetworkTopology from './components/NetworkTopology';
import NodeDetailPanel from './components/NodeDetailPanel';
import ChartsPanel from './components/ChartsPanel';
import EventLog from './components/EventLog';
import FailureAlerts from './components/FailureAlerts';
import EdgeServerPanel from './components/EdgeServerPanel';
import './index.css';

const Dashboard: React.FC = () => {
  const { isLoading } = useSimulation();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-ring" />
        <div className="text-center">
          <div style={{
            fontSize: '24px',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
            marginBottom: '8px',
          }}>
            HELIOS
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Loading network data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060a14] text-slate-200 overflow-hidden relative">
      <ParticleBackground />
      <FailureAlerts />
      <Header />

      <main className="flex-1 p-4 grid gap-4 relative z-10" style={{ gridTemplateColumns: '1fr 3fr 1fr', gridTemplateRows: 'auto 1fr auto' }}>
        
        {/* Top Left: KPIs */}
        <div className="col-span-1 row-span-1">
          <KPIPanel />
        </div>

        {/* Top Center: Topology */}
        <div className="col-span-1 row-span-2 relative">
          <NetworkTopology />
        </div>

        {/* Top Right: Detail Panel / Edge Panel */}
        <div className="col-span-1 row-span-2 flex flex-col gap-4">
          <div className="flex-1 h-1/2">
            <NodeDetailPanel />
          </div>
          <div className="flex-1 h-1/2">
            <EdgeServerPanel />
          </div>
        </div>

        {/* Middle Left: Health Gauge */}
        <div className="col-span-1 row-span-1 flex items-center justify-center glass-card-static">
          <HealthGauge />
        </div>

        {/* Bottom Left: Event Log */}
        <div className="col-span-1 row-span-1 h-48">
          <EventLog />
        </div>

        {/* Bottom Center & Right: Charts */}
        <div className="col-span-2 row-span-1 h-48">
          <ChartsPanel />
        </div>

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <Dashboard />
    </SimulationProvider>
  );
};

export default App;
