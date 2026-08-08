import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { FiWifiOff } from 'react-icons/fi';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import KPIPanel from './components/KPIPanel';
import HealthGauge from './components/HealthGauge';
import NetworkTopology from './components/NetworkTopology';
import NodeDetailPanel from './components/NodeDetailPanel';
import NodeInspector from './components/NodeInspector';
import EventLog from './components/EventLog';
import AlertsIncidentsPanel from './components/AlertsIncidentsPanel';
import EdgeServerPanel from './components/EdgeServerPanel';
import TowerUtilizationChart from './components/TowerUtilizationChart';
import AIDecisionsPanel from './components/ai/AIDecisionsPanel';
import HeliosAssistantPanel from './components/ai/HeliosAssistantPanel';
import SimulationTimeline from './components/timeline/SimulationTimeline';
import { NetworkSlicesContainer } from './components/NetworkSlicesContainer';
import Skeleton from './components/common/Skeleton';
import { ToastContainer } from './components/common/Toast';
import './index.css';

const GRID_STYLE: React.CSSProperties = { gridTemplateColumns: '340px 1fr 380px', gridTemplateRows: '1fr' };

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const DashboardSkeleton: React.FC = () => (
  <div className="h-screen w-screen flex flex-col bg-[#060a14] text-slate-200 overflow-hidden relative">
    <div className="header-gradient h-14 px-5 flex items-center justify-between shrink-0">
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
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" style={{ borderRadius: 8 }} />
          ))}
        </div>
        <Skeleton style={{ borderRadius: 8, height: 120, flexShrink: 0 }} />
        <Skeleton style={{ borderRadius: 8, flex: '1 1 0%' }} />
        <Skeleton style={{ borderRadius: 8, height: 200, flexShrink: 0 }} />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton style={{ borderRadius: 8, flex: '1.3 1 0%' }} />
        <Skeleton style={{ borderRadius: 8, flex: '1 1 0%' }} />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton style={{ borderRadius: 8, flex: '1.3 1 0%' }} />
        <Skeleton style={{ borderRadius: 8, height: 140, flexShrink: 0 }} />
        <Skeleton style={{ borderRadius: 8, flex: '1 1 0%' }} />
        <Skeleton style={{ borderRadius: 8, flex: '1 1 0%' }} />
        <Skeleton style={{ borderRadius: 8, flex: '1 1 0%' }} />
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

const ReconnectBanner: React.FC = () => {
  const { connectionStatus } = useSimulation();
  const show = connectionStatus === 'disconnected' || connectionStatus === 'reconnecting' || connectionStatus === 'error';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="reconnect-banner"
        >
          <FiWifiOff style={{ width: 13, height: 13 }} />
          {connectionStatus === 'error' ? 'Connection error — retrying…' : 'Connection lost — reconnecting…'}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Dashboard: React.FC = () => {
  const { isLoading } = useSimulation();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060a14] text-slate-200 overflow-hidden relative">
      <ParticleBackground />
      <ReconnectBanner />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <Header />
      </motion.div>

      <motion.main
        className="flex-1 min-h-0 p-5 grid gap-5 relative z-10"
        style={GRID_STYLE}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column: KPIs -> Network Health -> HELIOS Assistant -> AI Event Log */}
        <motion.div variants={cellVariants} className="flex flex-col gap-3 min-h-0">
          <div style={{ flexShrink: 0 }}>
            <KPIPanel />
          </div>
          <div className="glass-card-static flex items-center justify-center" style={{ flexShrink: 0, padding: '2px 4px' }}>
            <HealthGauge />
          </div>
          <div style={{ flex: '3 1 0%', minHeight: 0 }}>
            <HeliosAssistantPanel />
          </div>
          <div style={{ height: 175, flexShrink: 0 }}>
            <EventLog />
          </div>
        </motion.div>


        {/* Center column: Topology -> Simulation Replay -> Network Slices (compact, expandable) */}
        <motion.div variants={cellVariants} className="flex flex-col gap-4 min-h-0">
          <div style={{ flex: '1.3 1 0%', minHeight: 0 }}>
            <NetworkTopology />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <SimulationTimeline />
          </div>
          <div style={{ flexShrink: 0 }}>
            <NetworkSlicesContainer />
          </div>
        </motion.div>

        {/* Right column: Node Details -> AI Decisions -> Alerts & Incidents -> Edge Compute -> Tower Utilization */}
        <motion.div variants={cellVariants} className="flex flex-col gap-4 min-h-0">
          <div style={{ flex: '1.3 1 0%', minHeight: 0 }}>
            <NodeDetailPanel />
          </div>
          <div style={{ flexShrink: 0 }}>
            <AIDecisionsPanel />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <AlertsIncidentsPanel />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <EdgeServerPanel />
          </div>
          <div style={{ flex: '1 1 0%', minHeight: 0 }}>
            <TowerUtilizationChart />
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <Dashboard />
      <NodeInspector />
      <ToastContainer />
    </SimulationProvider>
  );
};

export default App;
