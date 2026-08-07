import React, { useCallback, useMemo, useRef } from 'react';
import type { MockFrame } from './MockTimelineData';

interface TimelineReplayChartProps {
  frames: MockFrame[];
  currentTick: number;
  totalTicks: number;
  onSeek: (tick: number) => void;
}

const WIDTH = 1000;
const HEIGHT = 150;
const PAD_TOP = 8;
const PAD_BOTTOM = 4;

function niceTicks(min: number, max: number, count: number): number[] {
  if (max <= min) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(min + step * i));
}

/**
 * Single combined replay chart — latency (blue, left axis) and bandwidth (purple, right axis)
 * on a shared X-axis, flat AWS-CloudWatch-style lines with no fills/gradients. Press-and-drag
 * anywhere to scrub; calls the same `controls.seekTo` the header's playback controls use.
 */
const TimelineReplayChart: React.FC<TimelineReplayChartProps> = ({ frames, currentTick, totalTicks, onSeek }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  const { latencyPoints, bandwidthPoints, latencyTicks, bandwidthTicks } = useMemo(() => {
    const latencyValues = frames.map((f) => f.avgLatencyMs);
    const bandwidthValues = frames.map((f) => f.avgBandwidthMbps);
    const lMin = Math.min(...latencyValues), lMax = Math.max(...latencyValues);
    const bMin = Math.min(...bandwidthValues), bMax = Math.max(...bandwidthValues);
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const toPoints = (values: number[], min: number, max: number) =>
      frames.map((f, i) => {
        const x = (f.hour / 24) * WIDTH;
        const range = max - min || 1;
        const y = PAD_TOP + innerH - ((values[i] - min) / range) * innerH;
        return { x, y };
      });

    return {
      latencyPoints: toPoints(latencyValues, lMin, lMax),
      bandwidthPoints: toPoints(bandwidthValues, bMin, bMax),
      latencyTicks: niceTicks(lMin, lMax, 4),
      bandwidthTicks: niceTicks(bMin, bMax, 4),
    };
  }, [frames]);

  const cursorX = (currentTick / (totalTicks - 1)) * WIDTH;
  const nearestFrameIdx = Math.min(frames.length - 1, Math.round((currentTick / (totalTicks - 1)) * (frames.length - 1)));
  const nearestFrame = frames[nearestFrameIdx];

  const pathFor = (points: { x: number; y: number }[]) => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const seekFromClientX = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * (totalTicks - 1)));
  }, [onSeek, totalTicks]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    seekFromClientX(e.clientX);
  };
  const handlePointerUp = () => { draggingRef.current = false; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="flex items-center gap-4" style={{ marginBottom: 4, flexShrink: 0 }}>
        <span className="flex items-center gap-1.5" style={{ fontSize: '10px', fontWeight: 600, color: '#93c5fd' }}>
          <span style={{ width: 12, height: 2, background: '#3b82f6', display: 'inline-block' }} /> Latency (ms)
        </span>
        <span className="flex items-center gap-1.5" style={{ fontSize: '10px', fontWeight: 600, color: '#c4b5fd' }}>
          <span style={{ width: 12, height: 2, background: '#a78bfa', display: 'inline-block' }} /> Bandwidth (Mbps)
        </span>
        {nearestFrame && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
            {nearestFrame.avgLatencyMs.toFixed(1)}ms · {nearestFrame.avgBandwidthMbps.toFixed(1)}Mbps
          </span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="timeline-graph-track"
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* gridlines */}
          {latencyTicks.map((t, i) => {
            const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) - (i / (latencyTicks.length - 1)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
            return <line key={t} x1={0} y1={y} x2={WIDTH} y2={y} stroke="rgba(148, 163, 184, 0.08)" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
          })}
          <path d={pathFor(latencyPoints)} fill="none" stroke="#3b82f6" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <path d={pathFor(bandwidthPoints)} fill="none" stroke="#a78bfa" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <line x1={cursorX} y1={0} x2={cursorX} y2={HEIGHT} stroke="rgba(226, 232, 240, 0.5)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        {/* axis labels (HTML overlay, keeps text crisp regardless of SVG scaling) */}
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[...latencyTicks].reverse().map((t) => (
            <span key={t} style={{ fontSize: '9px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{t}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
          {[...bandwidthTicks].reverse().map((t) => (
            <span key={t} style={{ fontSize: '9px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineReplayChart;
