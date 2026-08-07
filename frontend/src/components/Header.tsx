import React from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import SimulationControls from './SimulationControls';

const Header: React.FC = () => {
  return (
    <header className="header-gradient h-16 px-6 flex items-center justify-between shrink-0 z-50">
      {/* Brand & Search */}
      <div className="flex items-center gap-8 w-1/3">
        <div className="flex items-center gap-3">
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 900,
            color: '#fff',
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
          }}>
            H
          </div>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 900,
              background: 'linear-gradient(90deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
            }}>
              HELIOS
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              6G Digital Twin
            </div>
          </div>
        </div>
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
