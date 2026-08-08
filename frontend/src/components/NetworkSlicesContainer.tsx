import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { NetworkSlicesPanel } from './NetworkSlicesPanel';
import { BandwidthVisualization } from './BandwidthVisualization';

export const NetworkSlicesContainer: React.FC = () => {
  const { telemetry } = useSimulation();

  if (!telemetry || !telemetry.slices) {
    return (
      <div className="glass-card-static h-full p-6 flex flex-col items-center justify-center text-center">
        <span className="text-gray-200 font-semibold mb-2">Network Slices</span>
        <span className="text-gray-500 text-xs">No slice data available for current tower</span>
      </div>
    );
  }

  return (
    <div className="glass-card-static h-full flex flex-col gap-6 p-5 overflow-y-auto custom-scrollbar">
      <BandwidthVisualization slices={telemetry.slices} />
      <NetworkSlicesPanel slices={telemetry.slices} />
    </div>
  );
};
