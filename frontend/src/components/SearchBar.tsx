import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import type { NetworkNodeRow } from '../types';

const SearchBar: React.FC = () => {
  const { state } = useSimulation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<NetworkNodeRow[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = state.nodes.filter(
      (n) => n.node_id.toLowerCase().includes(q) || n.node_type.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 5));
  }, [query, state.nodes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setQuery('');
    setIsOpen(false);
    // Zoom to node
    const zoomFn = (window as unknown as Record<string, unknown>).__heliosZoomToNode;
    if (typeof zoomFn === 'function') {
      (zoomFn as (id: string) => void)(id);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
        🔍
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search nodes, towers, edges..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card-static py-2 z-50 animate-fade-in shadow-xl shadow-cyan-900/20">
          {results.map((r) => (
            <div
              key={r.node_id}
              className="px-4 py-2 hover:bg-cyan-900/20 cursor-pointer flex items-center justify-between transition-colors"
              onClick={() => handleSelect(r.node_id)}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{r.node_id}</span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                background: 'rgba(148, 163, 184, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {r.node_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
