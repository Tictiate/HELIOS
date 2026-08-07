import React, { useCallback, useRef } from 'react';

/** 13 fixed axis labels, every 2 hours — the fleet tick range (0..TOTAL_TICKS-1) always maps
 * onto a continuous virtual 24h clock (see SimulationContext), regardless of the real sample
 * spacing underneath. */
const TIMELINE_HOUR_LABELS: string[] = Array.from({ length: 13 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`);

interface TimelineScrubberProps {
  currentTick: number;
  totalTicks: number;
  onSeek: (tick: number) => void;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ currentTick, totalTicks, onSeek }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const seekFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * (totalTicks - 1)));
  }, [onSeek, totalTicks]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    seekFromClientX(e.clientX);
  };
  const handlePointerUp = () => { draggingRef.current = false; };

  const percent = (currentTick / (totalTicks - 1)) * 100;

  return (
    <div>
      <div className="flex justify-between" style={{ marginBottom: 6, padding: '0 2px' }}>
        {TIMELINE_HOUR_LABELS.map((label) => (
          <span
            key={label}
            onClick={() => onSeek(Math.round((parseInt(label, 10) / 24) * (totalTicks - 1)))}
            style={{ fontSize: '9px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        ref={trackRef}
        className="timeline-scrub-track"
        style={{ margin: '0 5px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="timeline-scrub-fill" style={{ width: `${percent}%` }} />
        {TIMELINE_HOUR_LABELS.map((label) => (
          <div key={label} className="timeline-scrub-tick" style={{ left: `${(parseInt(label, 10) / 24) * 100}%` }} />
        ))}
        <div className="timeline-scrub-handle" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
};

export default TimelineScrubber;
