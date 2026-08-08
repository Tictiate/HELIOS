import React from 'react';
import type { NetworkSlice } from '../types/backend';

interface BandwidthVisualizationProps {
  slices: NetworkSlice[];
  totalCapacityMbps?: number;
}

export const BandwidthVisualization: React.FC<BandwidthVisualizationProps> = ({ slices, totalCapacityMbps = 100 }) => {
  if (!slices || slices.length === 0) {
    return <div className="text-gray-400 text-sm italic">No slice data available</div>;
  }

  // Pre-defined colors for standard slice types
  const getColor = (sliceType: string) => {
    switch (sliceType.toLowerCase()) {
      case 'emergency': return 'bg-red-500';
      case 'voice': return 'bg-blue-500';
      case 'iot': return 'bg-purple-500';
      case 'gaming': return 'bg-orange-500';
      case 'video': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Tower Bandwidth Allocation</h3>
        <span className="text-xs text-gray-400">{totalCapacityMbps} Mbps Total</span>
      </div>
      
      {/* The Bar */}
      <div className="w-full h-8 flex rounded-md overflow-hidden bg-gray-800 border border-gray-700 shadow-inner">
        {slices.map((slice) => {
          const widthPct = (slice.allocated_bandwidth_mbps / totalCapacityMbps) * 100;
          return (
            <div
              key={slice.slice_id}
              style={{ width: `${widthPct}%` }}
              className={`${getColor(slice.slice_type)} h-full transition-all duration-500 ease-in-out border-r border-gray-800 last:border-r-0 relative group`}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none shadow-lg">
                <span className="font-bold">{slice.name}</span>: {slice.allocated_bandwidth_mbps} Mbps
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2">
        {slices.map((slice) => (
          <div key={slice.slice_id} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getColor(slice.slice_type)}`}></div>
            <span className="text-xs text-gray-400 font-medium">{slice.name} <span className="text-gray-500">({slice.allocated_bandwidth_mbps}M)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};
