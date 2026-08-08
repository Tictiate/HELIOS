import React from 'react';
import type { NetworkSlice } from '../types/backend';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface NetworkSlicesPanelProps {
  slices: NetworkSlice[];
}

export const NetworkSlicesPanel: React.FC<NetworkSlicesPanelProps> = ({ slices }) => {
  if (!slices || slices.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Network Slices</h2>
        <div className="text-gray-500 italic">No slice telemetry available.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col">
      <h2 className="text-lg font-bold text-gray-100 mb-4">Active Network Slices</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-2 px-3 font-semibold">Slice</th>
              <th className="py-2 px-3 font-semibold text-center">Priority</th>
              <th className="py-2 px-3 font-semibold text-right">Allocated (Mbps)</th>
              <th className="py-2 px-3 font-semibold text-right">Demand (Mbps)</th>
              <th className="py-2 px-3 font-semibold text-right">Latency (ms)</th>
              <th className="py-2 px-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {slices.map((slice) => {
              
              // Status formatting
              let statusIcon = <ShieldCheck className="w-4 h-4 text-emerald-500" />;
              let statusText = "HEALTHY";
              let statusClass = "text-emerald-500 bg-emerald-500/10";
              
              if (slice.status === 'VIOLATION') {
                statusIcon = <ShieldAlert className="w-4 h-4 text-red-500" />;
                statusText = "VIOLATION";
                statusClass = "text-red-500 bg-red-500/10 border-red-500/20";
              } else if (slice.status === 'DEGRADED') {
                statusIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                statusText = "DEGRADED";
                statusClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
              }

              // Priority formatting
              let priorityColor = "text-gray-400";
              if (slice.priority === "CRITICAL") priorityColor = "text-red-400 font-bold";
              else if (slice.priority === "HIGH") priorityColor = "text-orange-400 font-semibold";
              
              const isOverDemand = slice.current_demand_mbps > slice.allocated_bandwidth_mbps;

              return (
                <tr key={slice.slice_id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-200">{slice.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{slice.slice_type}</div>
                  </td>
                  <td className={`py-3 px-3 text-center text-xs ${priorityColor}`}>
                    {slice.priority}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-gray-200 font-mono">{slice.allocated_bandwidth_mbps.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`font-mono ${isOverDemand ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                      {slice.current_demand_mbps.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-gray-200 font-mono">{slice.current_latency_ms.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-500">tgt: {slice.latency_target_ms}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded border border-transparent ${statusClass}`}>
                      {statusIcon}
                      <span className="text-xs font-bold tracking-wider">{statusText}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
