import React from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import SimulationControls from './SimulationControls';

const Header: React.FC = () => {
  return (
    <header className="header-gradient h-14 px-5 flex items-center justify-between shrink-0 z-50">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="flex items-center gap-2.5">
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 900,
            color: '#fff',
            boxShadow: '0 0 16px rgba(34, 211, 238, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}>
            H
          </div>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1.2px',
              lineHeight: 1.1,
            }}>
              HELIOS
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: '1px' }}>
              6G Digital Twin
            </div>
          </div>
        </div>
        <div className="toolbar-divider h-7" />
        <SearchBar />
      </div>

      {/* Filters (Center) */}
      <div className="flex justify-center w-1/3">
        <FilterPanel />
      </div>

      {/* Controls (Right) */}
      <div className="flex justify-end w-1/3">
        <SimulationControls />
      </div>
    </header>
  );
};

export default Header;
