import Papa from 'papaparse';
import type {
  TowerUtilizationRow,
  TrafficProfileRow,
  TowerFailureRow,
  EdgeServerRow,
  NetworkHealthRow,
  NetworkNodeRow,
} from '../types';

export async function loadCSV<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export async function loadAllData() {
  const [towerUtil, trafficProfile, towerFailures, edgeServers, networkHealth, networkNodes] =
    await Promise.all([
      loadCSV<TowerUtilizationRow>('/data/tower_utilization.csv'),
      loadCSV<TrafficProfileRow>('/data/traffic_profile.csv'),
      loadCSV<TowerFailureRow>('/data/tower_failures.csv'),
      loadCSV<EdgeServerRow>('/data/edge_servers.csv'),
      loadCSV<NetworkHealthRow>('/data/network_health.csv'),
      loadCSV<NetworkNodeRow>('/data/network_nodes.csv'),
    ]);

  return {
    towerUtil,
    trafficProfile,
    towerFailures,
    edgeServers,
    networkHealth,
    networkNodes,
  };
}
