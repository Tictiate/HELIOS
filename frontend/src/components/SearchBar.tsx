import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
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
      <FiSearch className="icon icon-sm absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
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

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-2 glass-card-static py-1.5 z-50 shadow-xl shadow-cyan-900/20"
          >
            {results.map((r) => (
              <div
                key={r.node_id}
                className="px-4 py-2 hover:bg-cyan-500/10 cursor-pointer flex items-center justify-between transition-colors duration-150"
                onClick={() => handleSelect(r.node_id)}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.node_id}</span>
                <span className="label-caps-sm" style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}>
                  {r.node_type}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
