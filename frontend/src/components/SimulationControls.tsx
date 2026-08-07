import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const SimulationControls: React.FC = () => {
  const { state, controls } = useSimulation();
  const progress = ((state.currentTick + 1) / 1000) * 100;
  const speeds = [1, 2, 5, 10];

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Play/Pause/Reset */}
      <div className="flex items-center gap-2">
        <button
          className={`sim-btn ${state.isPlaying ? 'active' : ''}`}
          onClick={state.isPlaying ? controls.pause : controls.play}
          title={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? '⏸' : '▶'}
        </button>
        <button className="sim-btn" onClick={controls.reset} title="Reset">
          ⟲
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
      <div style={{ color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
        {state.timestamp.split(' ')[1] || '00:00:00'}
      </div>
    </div>
  );
};

export default SimulationControls;
