import React, { useRef, useEffect, useCallback } from 'react';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import { useSimulation } from '../context/SimulationContext';

// Build network topology elements
function buildElements(filters: { towers: boolean; users: boolean; edges: boolean; critical: boolean }) {
  const elements: cytoscape.ElementDefinition[] = [];

  // Core node
  elements.push({
    data: { id: 'Control', label: 'Core Network', nodeType: 'core' },
    position: { x: 400, y: 50 },
  });

  // Towers in a semicircle
  const towerIds = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
  if (filters.towers) {
    towerIds.forEach((id, i) => {
      const angle = (Math.PI / (towerIds.length + 1)) * (i + 1);
      elements.push({
        data: { id, label: id, nodeType: 'tower' },
        position: { x: 400 + Math.cos(angle) * 250 - 200, y: 50 + Math.sin(angle) * 220 },
      });
      // Core -> Tower edge
      elements.push({
        data: { id: `Control-${id}`, source: 'Control', target: id, edgeType: 'backbone' },
      });
    });
  }

  // Edge servers
  if (filters.edges) {
    const edgeIds = ['E1', 'E2', 'E3', 'E4'];
    edgeIds.forEach((id, i) => {
      const angle = (Math.PI / (edgeIds.length + 1)) * (i + 1);
      elements.push({
        data: { id, label: id, nodeType: 'edge' },
        position: { x: 400 + Math.cos(angle) * 160 - 100, y: 300 + Math.sin(angle) * 80 },
      });
      // Connect to nearest towers
      const connectedTowers = towerIds.slice(i * 2, i * 2 + 3);
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
      position: { x: 550, y: 350 },
    });
    // Connect hospital to some towers
    if (filters.towers) {
      ['T3', 'T5', 'T7'].forEach((tid) => {
        elements.push({
          data: { id: `${tid}-Hospital`, source: tid, target: 'Hospital', edgeType: 'critical-link' },
        });
      });
    }
  }

  // User clusters
  if (filters.users && filters.towers) {
    towerIds.forEach((tid, i) => {
      const uid = `U${i + 1}`;
      const towerEl = elements.find((e) => e.data.id === tid);
      const tx = towerEl?.position?.x ?? 400;
      const ty = towerEl?.position?.y ?? 200;
      elements.push({
        data: { id: uid, label: `Users ${i + 1}`, nodeType: 'user' },
        position: { x: tx + (i % 2 === 0 ? 80 : -80), y: ty + 100 },
      });
      elements.push({
        data: { id: `${tid}-${uid}`, source: tid, target: uid, edgeType: 'user-link' },
      });
    });
  }

  return elements;
}

const NetworkTopology: React.FC = () => {
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setSelectedNode, filters } = useSimulation();

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(filters),
      style: [
        {
          selector: 'node[nodeType="core"]',
          style: {
            'background-color': '#fb923c',
            label: 'data(label)',
            color: '#f1f5f9',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            width: 45,
            height: 45,
            'border-width': 3,
            'border-color': 'rgba(251, 146, 60, 0.5)',
            'text-outline-width': 2,
            'text-outline-color': '#060a14',
            'font-weight': 'bold' as const,
          },
        },
        {
          selector: 'node[nodeType="tower"]',
          style: {
            'background-color': '#3b82f6',
            label: 'data(label)',
            color: '#f1f5f9',
            'font-size': '9px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 35,
            height: 35,
            'border-width': 2,
            'border-color': 'rgba(59, 130, 246, 0.4)',
            'text-outline-width': 2,
            'text-outline-color': '#060a14',
          },
        },
        {
          selector: 'node[nodeType="edge"]',
          style: {
            'background-color': '#34d399',
            label: 'data(label)',
            color: '#f1f5f9',
            'font-size': '9px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 30,
            height: 30,
            'border-width': 2,
            'border-color': 'rgba(52, 211, 153, 0.4)',
            'text-outline-width': 2,
            'text-outline-color': '#060a14',
            shape: 'diamond' as const,
          },
        },
        {
          selector: 'node[nodeType="critical"]',
          style: {
            'background-color': '#f87171',
            label: 'data(label)',
            color: '#f1f5f9',
            'font-size': '9px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 35,
            height: 35,
            'border-width': 2,
            'border-color': 'rgba(248, 113, 113, 0.4)',
            'text-outline-width': 2,
            'text-outline-color': '#060a14',
            shape: 'star' as const,
          },
        },
        {
          selector: 'node[nodeType="user"]',
          style: {
            'background-color': '#64748b',
            label: 'data(label)',
            color: '#94a3b8',
            'font-size': '8px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            width: 20,
            height: 20,
            'border-width': 1,
            'border-color': 'rgba(100, 116, 139, 0.3)',
            'text-outline-width': 1,
            'text-outline-color': '#060a14',
            opacity: 0.7,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': 'rgba(148, 163, 184, 0.15)',
            'curve-style': 'bezier' as const,
            'line-style': 'solid' as const,
          },
        },
        {
          selector: 'edge[edgeType="backbone"]',
          style: {
            width: 2.5,
            'line-color': 'rgba(251, 146, 60, 0.25)',
            'line-style': 'solid' as const,
          },
        },
        {
          selector: 'edge[edgeType="critical-link"]',
          style: {
            width: 2,
            'line-color': 'rgba(248, 113, 113, 0.2)',
            'line-style': 'dashed' as const,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#22d3ee',
            'overlay-opacity': 0,
          },
        },
        {
          selector: '.failure',
          style: {
            'background-color': '#ef4444',
            'border-color': '#f87171',
            'border-width': 4,
          },
        },
        {
          selector: '.failure-edge',
          style: {
            'line-color': 'rgba(248, 113, 113, 0.6)',
            width: 3,
          },
        },
        {
          selector: '.heatmap-green',
          style: { 'background-color': '#34d399', 'border-color': 'rgba(52, 211, 153, 0.5)' },
        },
        {
          selector: '.heatmap-yellow',
          style: { 'background-color': '#fbbf24', 'border-color': 'rgba(251, 191, 36, 0.5)' },
        },
        {
          selector: '.heatmap-red',
          style: { 'background-color': '#f87171', 'border-color': 'rgba(248, 113, 113, 0.5)' },
        },
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Node click handler
    cy.on('tap', 'node', (evt: EventObject) => {
      const nodeId = evt.target.id();
      const nodeType = evt.target.data('nodeType');
      setSelectedNode({ id: nodeId, type: nodeType });
    });

    // Background click to deselect
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cy.fit(undefined, 40);
    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.towers, filters.users, filters.edges, filters.critical]);

  // Update heatmap & failures on tick change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Update tower heatmap colors
    state.towerData.forEach((tower, towerId) => {
      const node = cy.getElementById(towerId);
      if (node.length === 0) return;

      // Remove old heatmap classes
      node.removeClass('heatmap-green heatmap-yellow heatmap-red failure');

      // Calculate utilization (inverse of bandwidth — higher users = higher util)
      const utilization = Math.min(100, Math.max(0, 100 - tower.available_bandwidth_mbps));

      if (utilization < 40) {
        node.addClass('heatmap-green');
      } else if (utilization < 70) {
        node.addClass('heatmap-yellow');
      } else {
        node.addClass('heatmap-red');
      }
    });

    // Update failure states
    if (filters.failures) {
      state.failureData.forEach((failure, towerId) => {
        const node = cy.getElementById(towerId);
        if (node.length === 0) return;

        if (failure.failed === 1) {
          node.removeClass('heatmap-green heatmap-yellow heatmap-red');
          node.addClass('failure');
          // Highlight connected edges
          node.connectedEdges().addClass('failure-edge');
        } else {
          node.removeClass('failure');
          node.connectedEdges().removeClass('failure-edge');
        }
      });
    }
  }, [state.towerData, state.failureData, filters.failures]);

  // Public method to zoom to a node (called from search)
  const zoomToNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(nodeId);
    if (node.length > 0) {
      cy.animate({
        center: { eles: node },
        zoom: 2,
      }, { duration: 500 });
      node.select();
      setSelectedNode({ id: nodeId, type: node.data('nodeType') });
    }
  }, [setSelectedNode]);

  // Expose zoomToNode via window for cross-component use
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__heliosZoomToNode = zoomToNode;
    return () => { delete (window as unknown as Record<string, unknown>).__heliosZoomToNode; };
  }, [zoomToNode]);

  return (
    <div className="glass-card-static h-full relative overflow-hidden">
      <div
        className="absolute top-3 left-4 z-10 flex items-center gap-2"
        style={{ pointerEvents: 'none' }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Network Topology
        </span>
      </div>
      <div ref={containerRef} className="cytoscape-container" />
      {/* Legend */}
      <div
        className="absolute bottom-3 left-4 flex items-center gap-4"
        style={{ fontSize: '10px', color: 'var(--text-muted)' }}
      >
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} /> Core
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} /> Tower
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: '2px', background: '#34d399', display: 'inline-block', transform: 'rotate(45deg)' }} /> Edge
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, background: '#f87171', display: 'inline-block', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} /> Users
        </span>
      </div>
    </div>
  );
};

export default NetworkTopology;
