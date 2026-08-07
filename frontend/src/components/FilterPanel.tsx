import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const FilterPanel: React.FC = () => {
  const { filters, setFilters } = useSimulation();

  const toggle = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`filter-toggle ${filters.towers ? 'active' : ''}`}
        onClick={() => toggle('towers')}
      >
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        Towers
      </button>
      <button
        className={`filter-toggle ${filters.users ? 'active' : ''}`}
        onClick={() => toggle('users')}
      >
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        Users
      </button>
      <button
        className={`filter-toggle ${filters.edges ? 'active' : ''}`}
        onClick={() => toggle('edges')}
      >
        <span className="w-2 h-2 bg-emerald-400 rotate-45" />
        Edges
      </button>
      <button
        className={`filter-toggle ${filters.critical ? 'active' : ''}`}
        onClick={() => toggle('critical')}
      >
        <span className="w-2 h-2 bg-red-400" />
        Critical
      </button>
      <div className="w-px h-4 bg-slate-700/50 mx-1" />
      <button
        className={`filter-toggle ${filters.failures ? 'active' : ''}`}
        onClick={() => toggle('failures')}
      >
        ⚠️ Failures
      </button>
    </div>
  );
};

export default FilterPanel;
