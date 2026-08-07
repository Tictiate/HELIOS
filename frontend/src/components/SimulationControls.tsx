import React from 'react';
import { FiPlay, FiPause, FiRotateCcw } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import type { WsStatus } from '../services/websocket/websocket';

const CONNECTION_META: Record<WsStatus, { label: string; color: string; dot: string; pulse?: boolean }> = {
  connected: { label: 'CONNECTED', color: '#34d399', dot: 'green' },
  connecting: { label: 'CONNECTING', color: '#fbbf24', dot: 'yellow', pulse: true },
  reconnecting: { label: 'RECONNECTING', color: '#fbbf24', dot: 'yellow', pulse: true },
  disconnected: { label: 'DISCONNECTED', color: '#f87171', dot: 'red' },
  error: { label: 'CONNECTION ERROR', color: '#f87171', dot: 'red' },
};

const SimulationControls: React.FC = () => {
  const { state, controls, connectionStatus } = useSimulation();
  const progress = ((state.currentTick + 1) / 1000) * 100;
  const speeds = [1, 2, 5, 10];
  const connMeta = CONNECTION_META[connectionStatus];

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Play/Pause/Reset */}
      <div className="flex items-center gap-2">
        <button
          className={`sim-btn ${state.isPlaying ? 'active' : ''}`}
          onClick={state.isPlaying ? controls.pause : controls.play}
          title={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? <FiPause className="icon icon-sm" /> : <FiPlay className="icon icon-sm" />}
        </button>
        <button className="sim-btn" onClick={controls.reset} title="Reset">
          <FiRotateCcw className="icon icon-sm" />
        </button>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            className={`speed-btn ${state.speed === s ? 'active' : ''}`}
            onClick={() => controls.setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="sim-progress flex-1">
          <div className="sim-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: '70px' }}>
          {state.currentTick + 1} / 1000
        </span>
      </div>

      {/* Timestamp */}
      <div className="toolbar-divider h-6" />
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Simulation Time
        </div>
        <div style={{ color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          {state.timestamp.split(' ')[1] || '00:00:00'}
        </div>
      </div>
      <div className="connection-pill" style={{
        background: `${connMeta.color}1f`, border: `1px solid ${connMeta.color}4d`,
      }}>
        <span className={`indicator-dot ${connMeta.dot}`} style={{ width: 5, height: 5, animation: connMeta.pulse ? undefined : 'none' }} />
        <span style={{ color: connMeta.color }}>{connMeta.label}</span>
      </div>
    </div>
  );
};

export default SimulationControls;
