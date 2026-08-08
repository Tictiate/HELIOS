import React, { useRef, useEffect, useCallback } from 'react';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import { useSimulation } from '../context/SimulationContext';
import { buildElements, type TopologyFilters } from '../utils/topology';
import { getLinkStatus, EDGE_STATUS_META, type EdgeStatus } from '../utils/nodeMetrics';

type NodeCss = cytoscape.Css.Node & Record<string, unknown>;
type EdgeCss = cytoscape.Css.Edge & Record<string, unknown>;

const LINK_TYPES = new Set(['backbone', 'edge-link', 'critical-link']);
const LINK_CLASSES = 'link-healthy link-high-traffic link-warning link-critical';
const EDGE_WIDTH_MULTIPLIER: Record<string, number> = { backbone: 1.15, 'critical-link': 1.05, 'edge-link': 1 };

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function buildStylesheet(reducedMotion: boolean): cytoscape.StylesheetJson {
  const transitionDuration = reducedMotion ? 0 : 0.45;
  return [
    // ─── Smooth state transitions (e.g. a recovered node tweening back to green) ──
    // Note: gradient-array properties (background-gradient-stop-colors) are NOT safely
    // transition-able in cytoscape's canvas renderer — only scalar color/number properties.
    {
      selector: 'node',
      style: {
        'transition-property': 'border-color, underlay-opacity, underlay-padding',
        'transition-duration': transitionDuration,
        'transition-timing-function': 'ease-out',
      } as NodeCss,
    },
    {
      selector: 'edge',
      style: {
        'transition-property': 'line-color, width, opacity',
        'transition-duration': transitionDuration,
        'transition-timing-function': 'ease-out',
      } as EdgeCss,
    },
    // ─── Core ──────────────────────────────────────────────────────
    {
      selector: 'node[nodeType="core"]',
      style: {
        'background-fill': 'radial-gradient',
        'background-gradient-stop-colors': ['#fed7aa', '#ea580c'],
        'background-gradient-stop-positions': [0, 100],
        label: 'data(label)',
        color: '#f8fafc',
        'font-size': '11px',
        'font-weight': 800,
        'text-valign': 'bottom',
        'text-margin-y': 11,
        'text-transform': 'uppercase',
        'letter-spacing': '0.05em',
        width: 54,
        height: 54,
        'border-width': 3.5,
        'border-color': 'rgba(253, 186, 116, 0.65)',
        'text-outline-width': 2.5,
        'text-outline-color': '#060a14',
        'underlay-color': '#fb923c',
        'underlay-opacity': 0.3,
        'underlay-padding': 15,
        'underlay-shape': 'ellipse',
        'z-index': 50,
      } as NodeCss,
    },
    // ─── Tower (base — overridden per-tick by .heatmap-*) ─────────
    {
      selector: 'node[nodeType="tower"]',
      style: {
        'background-fill': 'radial-gradient',
        'background-gradient-stop-colors': ['#93c5fd', '#3b82f6'],
        'background-gradient-stop-positions': [0, 100],
        label: 'data(label)',
        color: '#f1f5f9',
        'font-size': '9px',
        'font-weight': 600,
        'text-valign': 'bottom',
        'text-margin-y': (ele: cytoscape.NodeSingular) => ele.data('labelOffset') as number,
        width: 36,
        height: 36,
        'border-width': 2,
        'border-color': 'rgba(59, 130, 246, 0.45)',
        'text-outline-width': 2,
        'text-outline-color': '#060a14',
        'underlay-color': '#3b82f6',
        'underlay-opacity': 0.12,
        'underlay-padding': 6,
        'underlay-shape': 'ellipse',
      } as NodeCss,
    },
    // ─── Edge server ────────────────────────────────────────────────
    {
      selector: 'node[nodeType="edge"]',
      style: {
        'background-fill': 'radial-gradient',
        'background-gradient-stop-colors': ['#6ee7b7', '#34d399'],
        'background-gradient-stop-positions': [0, 100],
        label: 'data(label)',
        color: '#f1f5f9',
        'font-size': '9px',
        'font-weight': 600,
        'text-valign': 'bottom',
        'text-margin-y': 6,
        width: 28,
        height: 28,
        'border-width': 2,
        'border-color': 'rgba(52, 211, 153, 0.45)',
        'text-outline-width': 2,
        'text-outline-color': '#060a14',
        shape: 'diamond' as const,
        'underlay-color': '#34d399',
        'underlay-opacity': 0.1,
        'underlay-padding': 5,
        'underlay-shape': 'ellipse',
      } as NodeCss,
    },
    // ─── Critical infra (Hospital) ─────────────────────────────────
    {
      selector: 'node[nodeType="critical"]',
      style: {
        'background-fill': 'radial-gradient',
        'background-gradient-stop-colors': ['#fca5a5', '#ef4444'],
        'background-gradient-stop-positions': [0, 100],
        label: 'data(label)',
        color: '#f8fafc',
        'font-size': '10px',
        'font-weight': 700,
        'text-valign': 'bottom',
        'text-margin-y': 7,
        width: 36,
        height: 36,
        'border-width': 2.5,
        'border-color': 'rgba(248, 113, 113, 0.55)',
        'text-outline-width': 2,
        'text-outline-color': '#060a14',
        shape: 'star' as const,
        'underlay-color': '#f87171',
        'underlay-opacity': 0.22,
        'underlay-padding': 9,
        'underlay-shape': 'ellipse',
      } as NodeCss,
    },
    // ─── User cluster ───────────────────────────────────────────────
    {
      selector: 'node[nodeType="user"]',
      style: {
        'background-color': '#64748b',
        label: 'data(label)',
        color: '#94a3b8',
        'font-size': '8px',
        'text-valign': 'bottom',
        'text-margin-y': (ele: cytoscape.NodeSingular) => ele.data('labelOffset') as number,
        width: 18,
        height: 18,
        'border-width': 1,
        'border-color': 'rgba(100, 116, 139, 0.3)',
        'text-outline-width': 1,
        'text-outline-color': '#060a14',
        opacity: 0.65,
      } as NodeCss,
    },
    // ─── Heatmap overrides (tower utilization, gradient-aware) ────
    {
      selector: '.heatmap-green',
      style: {
        'background-gradient-stop-colors': ['#6ee7b7', '#34d399'],
        'border-color': 'rgba(52, 211, 153, 0.55)',
        'underlay-color': '#34d399',
        'underlay-opacity': 0.16,
      } as NodeCss,
    },
    {
      selector: '.heatmap-yellow',
      style: {
        'background-gradient-stop-colors': ['#fde68a', '#fbbf24'],
        'border-color': 'rgba(251, 191, 36, 0.55)',
        'underlay-color': '#fbbf24',
        'underlay-opacity': 0.18,
      } as NodeCss,
    },
    {
      selector: '.heatmap-red',
      style: {
        'background-gradient-stop-colors': ['#fca5a5', '#f87171'],
        'border-color': 'rgba(248, 113, 113, 0.55)',
        'underlay-color': '#f87171',
        'underlay-opacity': 0.2,
      } as NodeCss,
    },
    {
      selector: '.failure',
      style: {
        'background-fill': 'radial-gradient',
        'background-gradient-stop-colors': ['#fca5a5', '#dc2626'],
        'border-color': '#fca5a5',
        'border-width': 4,
        'underlay-color': '#ef4444',
        'underlay-opacity': 0.45,
        'underlay-padding': 16,
        'z-index': 60,
      } as NodeCss,
    },
    // ─── Selection / hover ──────────────────────────────────────────
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#22d3ee',
        'overlay-opacity': 0,
        'underlay-color': '#22d3ee',
        'underlay-opacity': 0.28,
        'underlay-padding': 11,
        'z-index': 999,
      } as NodeCss,
    },
    { selector: 'node.hovered', style: { 'border-width': 3, 'z-index': 998 } as NodeCss },
    { selector: 'edge.hovered', style: { 'z-index': 998, 'line-opacity': 1 } as EdgeCss },
    { selector: '.dimmed', style: { opacity: 0.18 } },
    // ─── Edges (base) ────────────────────────────────────────────────
    {
      selector: 'edge',
      style: {
        width: 1.2,
        'line-color': 'rgba(148, 163, 184, 0.09)',
        'curve-style': 'bezier' as const,
        'line-style': 'solid' as const,
      },
    },
    {
      selector: 'edge[edgeType="backbone"]',
      style: { width: 1.75, 'line-color': 'rgba(251, 146, 60, 0.2)' },
    },
    {
      selector: 'edge[edgeType="critical-link"]',
      style: { width: 1.75, 'line-color': 'rgba(248, 113, 113, 0.25)', 'line-style': 'dashed' as const },
    },
    {
      selector: 'edge[edgeType="user-link"]',
      style: { width: 0.7, 'line-color': 'rgba(100, 116, 139, 0.07)' },
    },
    // ─── Link status (applied per-tick to backbone/edge-link/critical-link) ─
    {
      selector: '.link-healthy',
      style: {
        'line-color': EDGE_STATUS_META.healthy.color,
        opacity: 0.3,
        'line-style': 'dashed' as const,
        'line-dash-pattern': [7, 5],
      } as EdgeCss,
    },
    {
      selector: '.link-high-traffic',
      style: {
        'line-color': EDGE_STATUS_META['high-traffic'].color,
        opacity: 0.55,
        'line-style': 'dashed' as const,
        'line-dash-pattern': [7, 4],
      } as EdgeCss,
    },
    {
      selector: '.link-warning',
      style: {
        'line-color': EDGE_STATUS_META.warning.color,
        opacity: 0.65,
        'line-style': 'dashed' as const,
        'line-dash-pattern': [3, 3],
      } as EdgeCss,
    },
    {
      selector: '.link-critical',
      style: {
        'line-color': EDGE_STATUS_META.critical.color,
        opacity: 0.85,
        'line-style': 'dashed' as const,
        'line-dash-pattern': [8, 4],
      } as EdgeCss,
    },
    { selector: '.failure-edge', style: { 'line-color': '#f87171', width: 3 } },
  ];
}

const NetworkTopology: React.FC = () => {
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, selectedNode, setSelectedNode, filters } = useSimulation();

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const topologyFilters: TopologyFilters = {
      towers: filters.towers,
      users: filters.users,
      edges: filters.edges,
      critical: filters.critical,
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(topologyFilters),
      style: buildStylesheet(prefersReducedMotion()),
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      wheelSensitivity: 0.3,
      minZoom: 0.3,
      maxZoom: 3,
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const nodeId = evt.target.id();
      const nodeType = evt.target.data('nodeType');
      setSelectedNode({ id: nodeId, type: nodeType });
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cy.on('mouseover', 'node', (evt: EventObject) => {
      const neighborhood = evt.target.closedNeighborhood();
      cy.elements().not(neighborhood).addClass('dimmed');
      neighborhood.addClass('hovered');
    });
    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('dimmed hovered');
    });

    cy.fit(undefined, 60);
    cyRef.current = cy;

    // Shared animation loop: dash-offset "flow" on active links + pulse glow on failed nodes.
    let rafId: number | null = null;
    if (!prefersReducedMotion()) {
      let frame = 0;
      const step = () => {
        frame += 1;
        const pulse = 0.55 + Math.sin(frame * 0.06) * 0.25;
        cy.batch(() => {
          cy.edges('.link-healthy').style('line-dash-offset', -(frame * 0.15));
          cy.edges('.link-high-traffic').style('line-dash-offset', -(frame * 0.35));
          cy.edges('.link-critical').style('line-dash-offset', -(frame * 0.9));
          cy.nodes('.failure').style('underlay-opacity', pulse * 0.55);
          cy.nodes('.failure').style('underlay-padding', 12 + pulse * 10);
        });
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      cy.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.towers, filters.users, filters.edges, filters.critical]);

  // Update heatmap, failure state & link-status classes on tick change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      state.towerData.forEach((tower, towerId) => {
        const node = cy.getElementById(towerId);
        if (node.length === 0) return;

        node.removeClass('heatmap-green heatmap-yellow heatmap-red failure');

        const utilization = Math.min(100, Math.max(0, 100 - tower.available_bandwidth_mbps));
        const failure = state.failureData.get(towerId);
        const failed = !!(filters.failures && failure?.failed === 1);

        if (failed) {
          node.addClass('failure');
        } else if (utilization < 40) {
          node.addClass('heatmap-green');
        } else if (utilization < 70) {
          node.addClass('heatmap-yellow');
        } else {
          node.addClass('heatmap-red');
        }

        const status: EdgeStatus = getLinkStatus(utilization, failed);
        const connectedLinks = node.connectedEdges().filter((e) => LINK_TYPES.has(e.data('edgeType')));
        connectedLinks.removeClass(LINK_CLASSES).removeClass('failure-edge');
        connectedLinks.addClass(`link-${status}`);
        connectedLinks.forEach((edge) => {
          const multiplier = EDGE_WIDTH_MULTIPLIER[edge.data('edgeType') as string] ?? 1;
          edge.style('width', EDGE_STATUS_META[status].width * multiplier);
          if (status === 'critical') edge.addClass('failure-edge');
        });
      });
    });
  }, [state.towerData, state.failureData, filters.failures]);

  // Keep the graph's visual selection in sync with selectedNode (covers selection changes
  // that don't originate from a canvas tap, e.g. the "Connected Nodes" chips in NodeDetailPanel).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements(':selected').unselect();
    if (selectedNode) {
      cy.getElementById(selectedNode.id).select();
    }
  }, [selectedNode]);

  // Public method to zoom to a node (called from search)
  const zoomToNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(nodeId);
    if (node.length > 0) {
      cy.animate({
        center: { eles: node },
        zoom: 2,
      }, { duration: 550, easing: 'ease-out-cubic' });
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
        className="absolute top-3 left-4 z-10 flex items-center gap-2 px-2.5 py-1 rounded-md"
        style={{ pointerEvents: 'none', background: 'rgba(6, 10, 20, 0.55)', backdropFilter: 'blur(6px)' }}
      >
        <span className="label-caps" style={{ letterSpacing: '0.08em' }}>
          Network Topology
        </span>
      </div>
      <div ref={containerRef} className="cytoscape-container" />
      {/* Legend */}
      <div
        className="absolute bottom-3 left-4 flex flex-col gap-1.5 px-2.5 py-2 rounded-md"
        style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(6, 10, 20, 0.6)', backdropFilter: 'blur(6px)' }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb923c', display: 'inline-block', boxShadow: '0 0 6px rgba(251, 146, 60, 0.6)' }} /> Core
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', boxShadow: '0 0 6px rgba(59, 130, 246, 0.6)' }} /> Tower
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '2px', background: '#34d399', display: 'inline-block', transform: 'rotate(45deg)', boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)' }} /> Edge
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, background: '#f87171', display: 'inline-block', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', filter: 'drop-shadow(0 0 4px rgba(248, 113, 113, 0.6))' }} /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} /> Users
          </span>
        </div>
        <div className="flex items-center gap-4" style={{ paddingTop: '4px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
          {(['healthy', 'high-traffic', 'warning', 'critical'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 2, background: EDGE_STATUS_META[k].color, display: 'inline-block', borderRadius: 1 }} />
              {EDGE_STATUS_META[k].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
