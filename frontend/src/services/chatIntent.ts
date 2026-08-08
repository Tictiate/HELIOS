/**
 * HELIOS Assistant intent classification + response building.
 *
 * There is no real conversational/LLM backend behind this chatbox — the `/chat/intent` and
 * `/chat/analyze` routes that used to back it (see git history) are pure hardcoded keyword
 * matchers on both the frontend and backend, returning fabricated tower/confidence/user numbers
 * regardless of input. This module replaces that: a transparent, local heuristic classifier that
 * routes messages into a handful of categories, and only ever answers "network-aware" questions
 * from real `SimulationContext` data (via the same `getTowerUtilization`/`getTowerHealthScore`
 * helpers the topology and Node Inspector already use) or by triggering the real
 * `/scenarios/inject` REST action. Nothing here invents tower state, confidence, or strategies.
 */
import type { SimulationState } from '../types';
import { getTowerHealthScore, getTowerUtilization } from '../utils/nodeMetrics';

export type IntentCategory = 'casual' | 'info' | 'network' | 'operational' | 'ambiguous';

export interface NetworkDetail {
  label: string;
  value: string;
}

export interface AssistantReply {
  category: IntentCategory;
  text: string;
  /** Real metrics that back `text` — only present for `network` replies with something to show. */
  details?: NetworkDetail[];
  /** A real backend scenario name this message could trigger — only present for `operational`
   * replies that matched one of the 8 real scenario types. */
  matchedScenario?: string;
}

const CASUAL_PATTERNS = /^(hi|hey|hello|yo|sup|thanks|thank you|thx|ty|who are you|what('?s| is) your name|good (morning|afternoon|evening))\b/i;
const CAPABILITIES_PATTERNS = /what can you do|what do you do|help me|how (do|can) (i|you)\b.*\?|capabilities|what are you/i;

const GLOSSARY: { pattern: RegExp; term: string; text: string }[] = [
  {
    pattern: /\b5g\b/i,
    term: '5G',
    text: '5G is the fifth generation of mobile network technology — it offers higher bandwidth, lower latency, and supports network slicing for dedicated virtual networks over shared infrastructure.',
  },
  {
    pattern: /network slic(e|ing)/i,
    term: 'network slicing',
    text: 'Network slicing lets an operator partition a single physical network into multiple virtual networks, each tuned for a specific use case (e.g. low-latency, high-bandwidth, or massive IoT traffic).',
  },
  {
    pattern: /digital twin/i,
    term: 'digital twin',
    text: "A digital twin is a live virtual replica of a physical system — HELIOS's simulator mirrors real tower/edge telemetry so strategies can be tested against a predicted outcome before being applied.",
  },
  {
    pattern: /\bedge (computing|server)\b/i,
    term: 'edge computing',
    text: 'Edge computing runs workloads physically close to users (on edge servers near cell towers) instead of a distant data center, cutting latency for time-sensitive traffic.',
  },
  {
    pattern: /\burllc\b|ultra.reliable/i,
    term: 'URLLC',
    text: 'URLLC (Ultra-Reliable Low-Latency Communication) is a 5G service class built for latency- and reliability-critical use cases like V2X safety signaling or industrial automation.',
  },
  {
    pattern: /\bqos\b|quality of service/i,
    term: 'QoS',
    text: 'QoS (Quality of Service) is a set of traffic-prioritization policies that guarantee bandwidth, latency, or reliability for specific traffic classes over shared network resources.',
  },
];

const NETWORK_PATTERNS = /network health|how('?s| is) the network|latency|packet loss|bandwidth|availability|congest|struggl|overload|which tower|status of t\d+|\bt\d+\b.*(status|health|ok|okay|fine)|why is .*(slow|high|down|failing)/i;

const OPERATIONAL_PATTERNS = /prepare|optimi[sz]e|reduce|handle|deal with|there'?s a|there is a|expect(ing)? \d|scale up|scale down|mitigat|respond to|set up for|get ready/i;

const SCENARIO_KEYWORDS: { pattern: RegExp; scenario: string }[] = [
  { pattern: /concert|festival|stadium|crowd|event|game|match|rally/i, scenario: 'Traffic Surge' },
  { pattern: /ddos|cyber ?attack|security threat|botnet|breach/i, scenario: 'DDoS Attack' },
  { pattern: /heat ?wave|overheat|temperature spike/i, scenario: 'Heat Wave' },
  { pattern: /rain|storm|flood/i, scenario: 'Heavy Rain' },
  { pattern: /power (outage|failure|cut)|blackout/i, scenario: 'Power Failure' },
  { pattern: /fiber cut|backhaul (cut|damage)/i, scenario: 'Fiber Cut' },
  { pattern: /tower (down|failure|offline|failed)/i, scenario: 'Tower Failure' },
  { pattern: /edge server (down|failure|offline|failed)/i, scenario: 'Edge Server Failure' },
];

export function classifyMessage(text: string): IntentCategory {
  const t = text.trim();
  if (!t) return 'ambiguous';
  if (CASUAL_PATTERNS.test(t) || CAPABILITIES_PATTERNS.test(t)) return 'casual';
  if (GLOSSARY.some((g) => g.pattern.test(t)) && !NETWORK_PATTERNS.test(t)) return 'info';
  if (NETWORK_PATTERNS.test(t)) return 'network';
  if (OPERATIONAL_PATTERNS.test(t)) return 'operational';
  return 'ambiguous';
}

export function matchOperationalScenario(text: string): string | null {
  const hit = SCENARIO_KEYWORDS.find((k) => k.pattern.test(text));
  return hit ? hit.scenario : null;
}

export function buildCasualReply(text: string): AssistantReply {
  if (CAPABILITIES_PATTERNS.test(text)) {
    return {
      category: 'casual',
      text: "I monitor real-time network telemetry, surface AI-driven decisions and alerts, and can trigger simulated network events. Ask me about network health, a specific tower, or describe an operational situation and I'll tell you what I can actually do about it.",
    };
  }
  return { category: 'casual', text: "Hi! I'm HELIOS. How can I help you with the network today?" };
}

export function buildInfoReply(text: string): AssistantReply {
  const hit = GLOSSARY.find((g) => g.pattern.test(text));
  return { category: 'info', text: hit ? hit.text : "I don't have a definition for that on hand — try asking about network health or a specific tower instead." };
}

export function buildAmbiguousReply(): AssistantReply {
  return {
    category: 'ambiguous',
    text: "I'm not sure what action you'd like — HELIOS can report real network status (e.g. \"what's the network health?\") or trigger a simulated network event (e.g. a traffic surge, DDoS, or weather event). Could you clarify which you mean?",
  };
}

export function buildNetworkReply(text: string, state: SimulationState): AssistantReply {
  const t = text.toLowerCase();

  const towerMatch = t.match(/\bt(\d{1,2})\b/i);
  if (towerMatch) {
    const towerId = `T${towerMatch[1]}`;
    const tower = state.towerData.get(towerId);
    if (!tower) {
      return { category: 'network', text: `I don't have telemetry for ${towerId} — it may not exist in the current fleet (towers T1–T10 are tracked).` };
    }
    const failure = state.failureData.get(towerId);
    const failed = failure?.failed === 1;
    const utilization = getTowerUtilization(tower);
    const health = getTowerHealthScore(tower, failure);
    const congested = !failed && utilization >= 70;

    const details: NetworkDetail[] = [
      { label: 'Health score', value: `${health}/100` },
      { label: 'Utilization', value: `${utilization.toFixed(0)}%` },
      { label: 'Latency', value: `${tower.latency_ms.toFixed(1)} ms` },
      { label: 'Bandwidth', value: `${tower.available_bandwidth_mbps.toFixed(1)} Mbps` },
    ];

    let summary: string;
    if (failed) {
      summary = `${towerId} has failed in the current simulation — it's reporting no service. Health score is ${health}/100.`;
    } else if (congested) {
      summary = `${towerId} is congested — utilization is at ${utilization.toFixed(0)}% with ${tower.latency_ms.toFixed(1)}ms latency. Health score ${health}/100.`;
    } else {
      summary = `${towerId} looks fine right now — ${utilization.toFixed(0)}% utilization, ${tower.latency_ms.toFixed(1)}ms latency, health score ${health}/100. No congestion detected.`;
    }
    return { category: 'network', text: summary, details };
  }

  if (/which tower|struggl|worst/i.test(t)) {
    let worstId: string | null = null;
    let worstScore = 101;
    state.towerData.forEach((tower, id) => {
      const score = getTowerHealthScore(tower, state.failureData.get(id));
      if (score < worstScore) { worstScore = score; worstId = id; }
    });
    if (!worstId) {
      return { category: 'network', text: "I don't have tower telemetry loaded yet." };
    }
    const tower = state.towerData.get(worstId)!;
    return {
      category: 'network',
      text: `${worstId} has the lowest health score in the fleet right now (${worstScore}/100).`,
      details: [
        { label: 'Health score', value: `${worstScore}/100` },
        { label: 'Utilization', value: `${getTowerUtilization(tower).toFixed(0)}%` },
        { label: 'Latency', value: `${tower.latency_ms.toFixed(1)} ms` },
      ],
    };
  }

  // Network-wide health
  const h = state.healthData;
  if (!h) {
    return { category: 'network', text: "Network telemetry hasn't loaded yet — try again in a moment." };
  }
  const status = h.network_health_score >= 70 ? 'healthy' : h.network_health_score >= 40 ? 'in a warning state' : 'critical';
  return {
    category: 'network',
    text: `The network is ${status} — overall health score is ${h.network_health_score.toFixed(1)}/100.`,
    details: [
      { label: 'Health score', value: `${h.network_health_score.toFixed(1)}/100` },
      { label: 'Latency', value: `${h.latency_ms.toFixed(1)} ms` },
      { label: 'Packet loss', value: `${h.packet_loss_pct.toFixed(2)}%` },
      { label: 'Availability', value: `${h.availability_pct.toFixed(1)}%` },
    ],
  };
}

export function buildOperationalReply(text: string): AssistantReply {
  const scenario = matchOperationalScenario(text);
  if (!scenario) {
    return {
      ...buildAmbiguousReply(),
      text: "That sounds operational, but I don't have a backend action that matches it specifically — HELIOS can currently simulate: traffic surges, tower/edge/power/fiber failures, DDoS attacks, heat waves, and heavy rain. Would one of those fit, or would you like real telemetry for a specific tower instead?",
    };
  }
  return {
    category: 'operational',
    text: `That reads as a "${scenario}" scenario. I can trigger a real simulated ${scenario.toLowerCase()} event on the backend — the resulting AI decisions and alerts will appear live once it runs.`,
    matchedScenario: scenario,
  };
}

export function buildReply(text: string, state: SimulationState): AssistantReply {
  const category = classifyMessage(text);
  switch (category) {
    case 'casual': return buildCasualReply(text);
    case 'info': return buildInfoReply(text);
    case 'network': return buildNetworkReply(text, state);
    case 'operational': return buildOperationalReply(text);
    default: return buildAmbiguousReply();
  }
}
