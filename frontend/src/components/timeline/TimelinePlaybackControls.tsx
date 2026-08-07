import React from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';

const SPEEDS = [1, 2, 5, 10] as const;

interface TimelinePlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSetSpeed: (speed: number) => void;
}

const TimelinePlaybackControls: React.FC<TimelinePlaybackControlsProps> = ({ isPlaying, onTogglePlay, speed, onSetSpeed }) => (
  <div className="flex items-center gap-3">
    <button className={`timeline-btn ${isPlaying ? 'active' : ''}`} onClick={onTogglePlay}>
      {isPlaying ? <FiPause style={{ width: 10, height: 10 }} /> : <FiPlay style={{ width: 10, height: 10 }} />}
      {isPlaying ? 'Playing' : 'Play'}
    </button>
    <div className="flex items-center gap-1">
      {SPEEDS.map((s) => (
        <button
          key={s}
          className={`timeline-btn ${speed === s ? 'active' : ''}`}
          style={{ padding: '3px 7px' }}
          onClick={() => onSetSpeed(s)}
        >
          {s}x
        </button>
      ))}
    </div>
  </div>
);

export default TimelinePlaybackControls;
