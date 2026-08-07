import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const FilterPanel: React.FC = () => {
  const { filters, setFilters } = useSimulation();

  const toggle = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        className={`filter-toggle ${filters.towers ? 'active' : ''}`}
        onClick={() => toggle('towers')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
        Towers
      </button>
      <button
        className={`filter-toggle ${filters.users ? 'active' : ''}`}
        onClick={() => toggle('users')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
        Users
      </button>
      <button
        className={`filter-toggle ${filters.edges ? 'active' : ''}`}
        onClick={() => toggle('edges')}
      >
        <span className="w-1.5 h-1.5 bg-emerald-400 rotate-45 flex-shrink-0" />
        Edges
      </button>
      <button
        className={`filter-toggle ${filters.critical ? 'active' : ''}`}
        onClick={() => toggle('critical')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
        Critical
      </button>
      <div className="toolbar-divider h-4 mx-1" />
      <button
        className={`filter-toggle ${filters.failures ? 'active' : ''}`}
        onClick={() => toggle('failures')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
        Failures
      </button>
    </div>
  );
};

export default FilterPanel;
