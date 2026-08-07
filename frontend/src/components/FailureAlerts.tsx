import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

interface Alert {
  id: string;
  towerId: string;
  weather: string;
  timestamp: number;
}

const FailureAlerts: React.FC = () => {
  const { state } = useSimulation();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    state.failureData.forEach((failure, towerId) => {
      if (failure.failed === 1) {
        newAlerts.push({
          id: `${state.currentTick}-${towerId}`,
          towerId,
          weather: failure.weather,
          timestamp: Date.now(),
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => {
        // Keep existing alerts, add new ones if not already present for this tower
        const current = [...prev];
        newAlerts.forEach((na) => {
          if (!current.some((ca) => ca.towerId === na.towerId)) {
            current.push(na);
          }
        });
        return current;
      });
    } else {
      setAlerts([]);
    }
  }, [state.failureData, state.currentTick]);

  const removeAlert = (towerId: string) => {
    setAlerts((prev) => prev.filter((a) => a.towerId !== towerId));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="absolute top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-banner p-4 w-80 animate-slide-in-right pointer-events-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="text-red-400 font-bold text-sm">Critical Failure: {alert.towerId}</div>
                <div className="text-red-300/80 text-xs mt-1">
                  Conditions: {alert.weather}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.towerId)}
              className="text-red-400 hover:text-red-300 text-lg"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 text-xs text-red-200/60 font-mono">
            Auto-rerouting traffic to adjacent nodes...
          </div>
        </div>
      ))}
    </div>
  );
};

export default FailureAlerts;
