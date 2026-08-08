import type { IntentData } from '../components/ai/IntentCard';
import type { ProblemData } from '../components/ai/ProblemCard';
import type { StrategyData } from '../components/ai/StrategyCard';
import type { ResultsData } from '../components/ai/ResultsCard';

const API_BASE_URL = 'http://localhost:8000/api';

export interface AnalyzeResultData {
  problem: ProblemData;
  strategy: StrategyData;
  results: ResultsData;
  reasoning: string;
}

export async function fetchIntent(message: string): Promise<IntentData> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend connection failed, using intelligent intent parser fallback:', err);

    const text = message ? message.toLowerCase() : '';
    if (text.includes('stadium') || text.includes('sports')) {
      return {
        event: 'stadium_event',
        event_display: 'Stadium Event',
        goal: 'minimize_latency',
        goal_display: 'Minimize Latency',
        priority: 'high_bandwidth',
        priority_display: 'High Bandwidth Slicing',
        estimated_users: 50000,
      };
    } else if (text.includes('concert') || text.includes('music') || text.includes('festival')) {
      return {
        event: 'concert_festival',
        event_display: 'Concert / Music Festival',
        goal: 'optimize_throughput',
        goal_display: 'Maximize Throughput',
        priority: 'media_streaming',
        priority_display: 'Media Streaming Slicing',
        estimated_users: 35000,
      };
    } else if (text.includes('earthquake') || text.includes('disaster') || text.includes('emergency')) {
      return {
        event: 'emergency_earthquake',
        event_display: 'Emergency Disaster Relief',
        goal: 'guarantee_reliability',
        goal_display: 'Guarantee Link Reliability',
        priority: 'first_responders',
        priority_display: 'First Responders Priority Slice',
        estimated_users: 12000,
      };
    } else if (text.includes('autonomous') || text.includes('vehicle') || text.includes('car') || text.includes('v2x')) {
      return {
        event: 'autonomous_traffic',
        event_display: 'Autonomous Mobility Corridor',
        goal: 'ultra_low_latency',
        goal_display: 'Ultra-Low Latency (URLLC)',
        priority: 'v2x_safety',
        priority_display: 'V2X Safety Critical',
        estimated_users: 8500,
      };
    } else if (text.includes('cyber') || text.includes('attack') || text.includes('ddos') || text.includes('security')) {
      return {
        event: 'cyber_attack',
        event_display: 'Cyber Threat / Anomaly Detected',
        goal: 'isolate_malicious_traffic',
        goal_display: 'Isolate Threat & Protect Core',
        priority: 'zero_trust_security',
        priority_display: 'Zero-Trust Isolation',
        estimated_users: 24000,
      };
    } else {
      return {
        event: 'custom_operator_intent',
        event_display: 'Operator Optimization Intent',
        goal: 'dynamic_load_balancing',
        goal_display: 'Dynamic Load Balancing',
        priority: 'adaptive_qos',
        priority_display: 'Adaptive QoS Slicing',
        estimated_users: 25000,
      };
    }
  }
}

export async function fetchAnalysis(intent: IntentData): Promise<AnalyzeResultData> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend connection failed, using analysis fallback:', err);
    if (intent.event === 'stadium_event') {
      return {
        problem: {
          title: 'Tower T7 & T8 Congestion',
          description: 'Cell tower T7 and adjacent tower T8 will experience severe spectral crowding exceeding 95% throughput capacity.',
          prediction_confidence: 96,
          affected_users: 28000,
        },
        strategy: {
          title: 'Stadium Event Orchestration',
          actions: [
            'Deploy Stadium High-Density 5G Network Slice',
            'Offload non-essential traffic to Edge Server E2',
            'Reconfigure beamforming vectors on Tower T7 & T8',
            'Allocate +40MHz mmWave spectrum dynamically',
          ],
        },
        results: {
          latency_before: 45,
          latency_after: 12,
          health_before: 62,
          health_after: 96,
          confidence: 96,
        },
        reasoning: 'Predictive telemetry indicates a 3.4x spike in uplink video streams. Offloading background processes to Edge Server E2 frees 45% RF capacity on Tower T7, restoring sub-15ms latency across all active stadium slices.',
      };
    } else if (intent.event === 'concert_festival') {
      return {
        problem: {
          title: 'Uplink Throughput Bottleneck',
          description: 'Mass social media uploading is overwhelming macro-cell uplink queues, causing packet drops.',
          prediction_confidence: 93,
          affected_users: 19500,
        },
        strategy: {
          title: 'High-Throughput Media Slice',
          actions: [
            'Instantiate Uplink-Boosted QoS Profile',
            'Activate CoMP (Coordinated Multi-Point) transmission',
            'Reroute backbone traffic through Edge Server E1',
            'Throttle non-priority background sync tasks',
          ],
        },
        results: {
          latency_before: 38,
          latency_after: 16,
          health_before: 70,
          health_after: 94,
          confidence: 93,
        },
        reasoning: 'CoMP activation enables adjacent micro-cells to pool uplink bandwidth, satisfying high video upload demand without degrading voice or critical telemetry streams.',
      };
    } else if (intent.event === 'emergency_earthquake') {
      return {
        problem: {
          title: 'Fiber Backhaul Degradation',
          description: 'Primary fiber backhaul degraded near sector B; emergency first responder communications at risk of packet drops.',
          prediction_confidence: 99,
          affected_users: 12000,
        },
        strategy: {
          title: 'First Responder Priority Slice',
          actions: [
            'Isolate Priority 0 Emergency Communications Slice',
            'Failover backhaul to Satellite/Microwave redundant link',
            'Preempt low-priority commercial traffic',
            'Deploy dynamic Mesh routing across active towers',
          ],
        },
        results: {
          latency_before: 78,
          latency_after: 8,
          health_before: 42,
          health_after: 98,
          confidence: 99,
        },
        reasoning: 'Preempting commercial data slices guarantees 100% link availability for emergency services. Redundant microwave failover bypasses degraded fiber links with zero packet loss.',
      };
    } else if (intent.event === 'autonomous_traffic') {
      return {
        problem: {
          title: 'URLLC Latency Jitter Anomaly',
          description: 'Intermittent latency spikes on V2X safety channel threaten autonomous vehicle platooning synchronization.',
          prediction_confidence: 97,
          affected_users: 8500,
        },
        strategy: {
          title: 'URLLC V2X Safety Orchestration',
          actions: [
            'Lock Ultra-Reliable Low-Latency (URLLC) Sub-1ms Slice',
            'Pin V2X control loops to local Edge Server E3',
            'Enforce strict priority queueing on transport layer',
            'Activate redundant dual-connectivity link paths',
          ],
        },
        results: {
          latency_before: 28,
          latency_after: 4,
          health_before: 78,
          health_after: 99,
          confidence: 97,
        },
        reasoning: 'Edge Server E3 local termination reduces round-trip time from 28ms to 4ms, ensuring real-time vehicle-to-infrastructure safety signaling under safety compliance limits.',
      };
    } else if (intent.event === 'cyber_attack') {
      return {
        problem: {
          title: 'Volumetric DDoS & Core Anomaly',
          description: 'Abnormal packet flood directed at Core Gateway G1 detected from external botnet IP ranges.',
          prediction_confidence: 98,
          affected_users: 24000,
        },
        strategy: {
          title: 'Zero-Trust Threat Containment',
          actions: [
            'Trigger Autonomous BGP Blackholing on attacking IPs',
            'Isolate affected subnet into Zero-Trust Honeypot',
            'Reroute clean core traffic through Edge Firewall EF1',
            'Rotate cryptographic keys across inter-tower links',
          ],
        },
        results: {
          latency_before: 92,
          latency_after: 15,
          health_before: 35,
          health_after: 95,
          confidence: 98,
        },
        reasoning: 'Autonomous BGP filtering drops 99.8% of malicious ingress traffic at the border router, protecting core network resources and restoring normal operational latency.',
      };
    } else {
      return {
        problem: {
          title: 'Tower T7 Congestion',
          description: 'Tower T7 is expected to exceed safe utilization during peak operating hours.',
          prediction_confidence: 91,
          affected_users: 18000,
        },
        strategy: {
          title: 'Selected Strategy',
          actions: [
            'Create Event Slice',
            'Redistribute Users',
            'Activate Tower T9',
            'Move workloads to Edge Server E2',
          ],
        },
        results: {
          latency_before: 32,
          latency_after: 14,
          health_before: 85,
          health_after: 97,
          confidence: 91,
        },
        reasoning: 'This strategy minimizes congestion while maintaining the best latency and resource utilization across the network.',
      };
    }
  }
}

export async function runSimulation(strategyTitle: string): Promise<{ status: string; message: string; simulation_id: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy_title: strategyTitle }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend simulation endpoint failed, using fallback:', err);
    return {
      status: 'success',
      message: `Digital Twin simulation started for ${strategyTitle}`,
      simulation_id: 'sim_fallback',
    };
  }
}
