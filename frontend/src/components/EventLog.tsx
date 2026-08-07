import React, { useRef, useEffect } from 'react';
import { FiCpu } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';

const severityDot: Record<string, string> = {
  info: 'blue',
  warning: 'yellow',
  critical: 'red',
  success: 'green',
};

const EventLog: React.FC = () => {
  const { events } = useSimulation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header">
        <FiCpu className="icon icon-sm" style={{ color: 'var(--accent-cyan)' }} />
        <span className="label-caps">AI Event Log</span>
        <span className="panel-badge">{events.length}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: '100%' }}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Waiting for simulation data...
          </div>
        ) : (
          events.slice(-50).map((event) => (
            <div key={event.id} className={`event-item ${event.severity}`}>
              <div className="flex items-start gap-2.5">
                <span className={`indicator-dot ${severityDot[event.severity]}`} style={{ marginTop: '4px', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {event.timestamp}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    {event.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;
