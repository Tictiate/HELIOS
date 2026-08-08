import type cytoscape from 'cytoscape';
import type { FilterState } from '../types';

export type TopologyFilters = Pick<FilterState, 'towers' | 'users' | 'edges' | 'critical'>;

const ALL_FILTERS: TopologyFilters = { towers: true, users: true, edges: true, critical: true };

export const TOWER_IDS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
export const EDGE_IDS = ['E1', 'E2', 'E3', 'E4'];
export const HOSPITAL_LINKED_TOWERS = ['T3', 'T5', 'T7'];

/**
 * Builds the (hardcoded, synthetic) HELIOS network graph. Same topology every call —
 * only `filters` changes which categories of nodes/edges are included.
 */
export function buildElements(filters: TopologyFilters): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = [];

  // Core node
  elements.push({
    data: { id: 'Control', label: 'Core Network', nodeType: 'core' },
    position: { x: 400, y: 50 },
  });

  // Towers in a semicircle
  if (filters.towers) {
    TOWER_IDS.forEach((id, i) => {
      const angle = (Math.PI / (TOWER_IDS.length + 1)) * (i + 1);
      elements.push({
        data: { id, label: id, nodeType: 'tower', labelOffset: i % 2 === 0 ? 7 : 15 },
        position: { x: 400 + Math.cos(angle) * 310 - 200, y: 50 + Math.sin(angle) * 275 },
      });
      // Core -> Tower edge
      elements.push({
        data: { id: `Control-${id}`, source: 'Control', target: id, edgeType: 'backbone' },
      });
    });
  }

  // Edge servers
  if (filters.edges) {
    EDGE_IDS.forEach((id, i) => {
      const angle = (Math.PI / (EDGE_IDS.length + 1)) * (i + 1);
      elements.push({
        data: { id, label: id, nodeType: 'edge' },
        position: { x: 400 + Math.cos(angle) * 190 - 100, y: 320 + Math.sin(angle) * 95 },
      });
      // Connect to nearest towers
      const connectedTowers = TOWER_IDS.slice(i * 2, i * 2 + 3);
      connectedTowers.forEach((tid) => {
        if (filters.towers) {
          elements.push({
            data: { id: `${tid}-${id}`, source: tid, target: id, edgeType: 'edge-link' },
          });
        }
      });
    });
  }

  // Hospital (critical infrastructure)
  if (filters.critical) {
    elements.push({
      data: { id: 'Hospital', label: 'Hospital', nodeType: 'critical' },
      position: { x: 580, y: 375 },
    });
    // Connect hospital to some towers
    if (filters.towers) {
      HOSPITAL_LINKED_TOWERS.forEach((tid) => {
        elements.push({
          data: { id: `${tid}-Hospital`, source: tid, target: 'Hospital', edgeType: 'critical-link' },
        });
      });
    }
  }

  // User clusters
  if (filters.users && filters.towers) {
    TOWER_IDS.forEach((tid, i) => {
      const uid = `U${i + 1}`;
      const towerEl = elements.find((e) => e.data.id === tid);
      const tx = towerEl?.position?.x ?? 400;
      const ty = towerEl?.position?.y ?? 200;
      elements.push({
        data: { id: uid, label: `Users ${i + 1}`, nodeType: 'user', labelOffset: i % 2 === 0 ? 5 : 11 },
        position: { x: tx + (i % 2 === 0 ? 100 : -100), y: ty + 120 },
      });
      elements.push({
        data: { id: `${tid}-${uid}`, source: tid, target: uid, edgeType: 'user-link' },
      });
    });
  }

  return elements;
}

let adjacencyCache: Map<string, Set<string>> | null = null;

function getAdjacency(): Map<string, Set<string>> {
  if (adjacencyCache) return adjacencyCache;
  const adjacency = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  };
  buildElements(ALL_FILTERS).forEach((el) => {
    const { source, target } = el.data as { source?: string; target?: string };
    if (source && target) link(source, target);
  });
  adjacencyCache = adjacency;
  return adjacency;
}

/** Full-topology adjacency lookup (ignores active filters) — always reflects the true graph. */
export function getConnectedNodeIds(nodeId: string): string[] {
  const neighbors = getAdjacency().get(nodeId);
  return neighbors ? Array.from(neighbors).sort() : [];
}
