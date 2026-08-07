import React, { useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

const severityIcons: Record<string, string> = {
  info: '🔵',
  warning: '🟡',
  critical: '🔴',
  success: '🟢',
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
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <span style={{ fontSize: '14px' }}>🤖</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          AI Event Log
        </span>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--accent-cyan)',
          background: 'rgba(34, 211, 238, 0.1)',
          padding: '2px 8px',
          borderRadius: '10px',
          marginLeft: 'auto'
        }}>
          {events.length} events
        </span>
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
              <div className="flex items-start gap-2">
                <span style={{ fontSize: '12px', flexShrink: 0 }}>{severityIcons[event.severity]}</span>
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
