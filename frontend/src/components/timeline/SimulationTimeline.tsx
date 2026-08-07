import React from 'react';
import { FiClock, FiRadio, FiPlayCircle, FiLoader } from 'react-icons/fi';
import { useSimulation, TOTAL_TICKS } from '../../context/SimulationContext';
import TimelineReplayChart from './TimelineReplayChart';
import TimelineScrubber from './TimelineScrubber';
import TimelinePlaybackControls from './TimelinePlaybackControls';

const SIMULATION_DURATION_LABEL = '24:00:00';

/**
 * Pure reflection of the shared simulation state — owns no play/speed/position state of its
 * own. Header Play/Pause/Speed is the one controller; clicking/dragging here calls the exact
 * same `controls.seekTo`/`play`/`pause`/`setSpeed` the header uses, so both stay trivially in
 * sync. The chart/scrubber replay the real per-tower fleet history fetched from the backend.
 * The Live/Replay toggle switches the AI-loop panels (Predictions/Strategies) between the live
 * WebSocket feed and scrubbed `/history` snapshots — see SimulationContext for details.
 */
const SimulationTimeline: React.FC = () => {
  const { state, controls, dailySeries, isReplaying, isReplayLoading, replaySnapshotCount, enterReplay, exitReplay } = useSimulation();

  const progressPct = (state.currentTick / (TOTAL_TICKS - 1)) * 100;
  const currentTimeStr = state.timestamp.split(' ')[1] || '00:00:00';

  return (
    <div className="timeline-panel p-3 h-full flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
        <FiClock style={{ width: 11, height: 11, color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Simulation Replay
        </span>
        <button
          onClick={isReplaying ? exitReplay : enterReplay}
          disabled={isReplayLoading}
          className={`timeline-btn ${isReplaying ? 'active' : ''}`}
          style={{ marginLeft: 'auto', padding: '3px 9px' }}
          title={isReplaying ? 'Return to live AI decisions' : 'Replay AI decisions from backend snapshot history'}
        >
          {isReplayLoading ? (
            <FiLoader style={{ width: 10, height: 10, animation: 'spin 1s linear infinite' }} />
          ) : isReplaying ? (
            <FiRadio style={{ width: 10, height: 10 }} />
          ) : (
            <FiPlayCircle style={{ width: 10, height: 10 }} />
          )}
          {isReplayLoading ? 'Loading…' : isReplaying ? `Replay (${replaySnapshotCount})` : 'Live'}
        </button>
      </div>

      <TimelineReplayChart points={dailySeries} currentTick={state.currentTick} totalTicks={TOTAL_TICKS} onSeek={controls.seekTo} />

      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: 8, flexShrink: 0 }}>
        <TimelineScrubber currentTick={state.currentTick} totalTicks={TOTAL_TICKS} onSeek={controls.seekTo} />

        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <div className="flex items-center" style={{ gap: 18 }}>
            <InfoStat label="Current Time" value={currentTimeStr} />
            <InfoStat
              label="Status"
              value={
                <span className="flex items-center gap-1.5">
                  <span className={`indicator-dot ${state.isPlaying ? 'green' : ''}`} style={{ width: 5, height: 5, background: state.isPlaying ? undefined : '#64748b', boxShadow: state.isPlaying ? undefined : 'none' }} />
                  {state.isPlaying ? 'Playing' : 'Paused'}
                </span>
              }
            />
            <InfoStat label="Speed" value={`${state.speed}x`} />
            <InfoStat label="Duration" value={SIMULATION_DURATION_LABEL} />
            <InfoStat label="Progress" value={`${progressPct.toFixed(1)}%`} />
          </div>
          <TimelinePlaybackControls isPlaying={state.isPlaying} onTogglePlay={state.isPlaying ? controls.pause : controls.play} speed={state.speed} onSetSpeed={controls.setSpeed} />
        </div>
      </div>
    </div>
  );
};

const InfoStat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
  </div>
);

export default SimulationTimeline;
