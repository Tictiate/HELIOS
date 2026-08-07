import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import KPIPanel from './components/KPIPanel';
import HealthGauge from './components/HealthGauge';
import NetworkTopology from './components/NetworkTopology';
import NodeDetailPanel from './components/NodeDetailPanel';
import ChartsPanel from './components/ChartsPanel';
import EventLog from './components/EventLog';
import AlertsIncidentsPanel from './components/AlertsIncidentsPanel';
import EdgeServerPanel from './components/EdgeServerPanel';
import AIRecommendationPanel from './components/ai/AIRecommendationPanel';
import Skeleton from './components/common/Skeleton';
import './index.css';

const GRID_STYLE: React.CSSProperties = { gridTemplateColumns: '1fr 3fr 1fr', gridTemplateRows: 'auto minmax(0, 1fr) auto' };

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const DashboardSkeleton: React.FC = () => (
  <div className="h-screen w-screen flex flex-col bg-[#060a14] text-slate-200 overflow-hidden relative">
    <div className="header-gradient h-16 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 w-1/3">
        <Skeleton className="w-8 h-8" style={{ borderRadius: 10 }} />
        <Skeleton className="w-28 h-4" />
      </div>
      <div className="flex justify-center w-1/3">
        <Skeleton className="w-64 h-7" style={{ borderRadius: 8 }} />
      </div>
      <div className="flex justify-end w-1/3">
        <Skeleton className="w-40 h-8" style={{ borderRadius: 8 }} />
      </div>
    </div>
    <main className="flex-1 p-4 grid gap-4" style={GRID_STYLE}>
      <div className="col-span-1 row-span-1 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" style={{ borderRadius: 14 }} />
        ))}
      </div>
      <div className="col-span-1 row-span-2">
        <Skeleton className="w-full h-full" style={{ borderRadius: 16 }} />
      </div>
      <div className="col-span-1 row-span-2 flex flex-col gap-3">
        <Skeleton style={{ borderRadius: 16, flex: '1.4 1 0%' }} />
        <Skeleton style={{ borderRadius: 16, height: 84, flexShrink: 0 }} />
        <Skeleton style={{ borderRadius: 16, flex: '1 1 0%' }} />
        <Skeleton style={{ borderRadius: 16, flex: '1 1 0%' }} />
      </div>
      <div className="col-span-1 row-span-1">
        <Skeleton className="w-full h-full" style={{ borderRadius: 16 }} />
      </div>
      <div className="col-span-1 row-span-1 h-48">
        <Skeleton className="w-full h-full" style={{ borderRadius: 16 }} />
      </div>
      <div className="col-span-2 row-span-1 h-48 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-full" style={{ borderRadius: 14 }} />
        ))}
      </div>
    </main>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)' }}>
      <span className="loading-ring" style={{ width: 14, height: 14, borderWidth: 2 }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
        Loading network data…
      </span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { isLoading } = useSimulation();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060a14] text-slate-200 overflow-hidden relative">
      <ParticleBackground />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <Header />
      </motion.div>

      <motion.main
        className="flex-1 min-h-0 p-4 grid gap-4 relative z-10"
        style={GRID_STYLE}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Top Left: KPIs */}
        <motion.div variants={cellVariants} className="col-span-1 row-span-1">
          <KPIPanel />
        </motion.div>

        {/* Top Center: Topology */}
        <motion.div variants={cellVariants} className="col-span-1 row-span-2 relative">
          <NetworkTopology />
        </motion.div>

        {/* Top Right: Node Details -> AI Recommendation -> Alerts & Incidents -> Edge Compute */}
        <motion.div variants={cellVariants} className="col-span-1 row-span-2 flex flex-col gap-3 min-h-0">
          <div style={{ flex: '1.4 1 0%', minHeight: 0 }}>
            <NodeDetailPanel />
          </div>
          <div style={{ flexShrink: 0 }}>
            <AIRecommendationPanel />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <AlertsIncidentsPanel />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <EdgeServerPanel />
          </div>
        </motion.div>

        {/* Middle Left: Health Gauge */}
        <motion.div variants={cellVariants} className="col-span-1 row-span-1 flex items-center justify-center glass-card-static">
          <HealthGauge />
        </motion.div>

        {/* Bottom Left: Event Log */}
        <motion.div variants={cellVariants} className="col-span-1 row-span-1 h-48">
          <EventLog />
        </motion.div>

        {/* Bottom Center & Right: Charts */}
        <motion.div variants={cellVariants} className="col-span-2 row-span-1 h-48">
          <ChartsPanel />
        </motion.div>

      </motion.main>
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
