from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import (
    IntentRequest,
    IntentData,
    AnalyzeRequest,
    AnalyzeResultData,
    ProblemData,
    StrategyData,
    ResultsData,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/intent", response_model=IntentData, status_code=status.HTTP_200_OK)
async def parse_intent(payload: IntentRequest) -> IntentData:
    """
    Responsibility 1: Understand operator intent from natural language prompts.
    Parses operator intent and categorizes into structured event, goal, priority, and crowd estimation.
    """
    message_text = payload.message.lower() if payload.message else ""

    if "stadium" in message_text or "sports" in message_text:
        return IntentData(
            event="stadium_event",
            event_display="Stadium Event",
            goal="minimize_latency",
            goal_display="Minimize Latency",
            priority="high_bandwidth",
            priority_display="High Bandwidth Slicing",
            estimated_users=50000,
        )
    elif "concert" in message_text or "music" in message_text or "festival" in message_text:
        return IntentData(
            event="concert_festival",
            event_display="Concert / Music Festival",
            goal="optimize_throughput",
            goal_display="Maximize Throughput",
            priority="media_streaming",
            priority_display="Media Streaming Slicing",
            estimated_users=35000,
        )
    elif "earthquake" in message_text or "disaster" in message_text or "emergency" in message_text:
        return IntentData(
            event="emergency_earthquake",
            event_display="Emergency Disaster Relief",
            goal="guarantee_reliability",
            goal_display="Guarantee Link Reliability",
            priority="first_responders",
            priority_display="First Responders Priority Slice",
            estimated_users=12000,
        )
    elif "autonomous" in message_text or "vehicle" in message_text or "car" in message_text or "v2x" in message_text:
        return IntentData(
            event="autonomous_traffic",
            event_display="Autonomous Mobility Corridor",
            goal="ultra_low_latency",
            goal_display="Ultra-Low Latency (URLLC)",
            priority="v2x_safety",
            priority_display="V2X Safety Critical",
            estimated_users=8500,
        )
    elif "cyber" in message_text or "attack" in message_text or "ddos" in message_text or "security" in message_text:
        return IntentData(
            event="cyber_attack",
            event_display="Cyber Threat / Anomaly Detected",
            goal="isolate_malicious_traffic",
            goal_display="Isolate Threat & Protect Core",
            priority="zero_trust_security",
            priority_display="Zero-Trust Isolation",
            estimated_users=24000,
        )
    else:
        return IntentData(
            event="custom_operator_intent",
            event_display="Operator Optimization Intent",
            goal="dynamic_load_balancing",
            goal_display="Dynamic Load Balancing",
            priority="adaptive_qos",
            priority_display="Adaptive QoS Slicing",
            estimated_users=25000,
        )


@router.post("/analyze", response_model=AnalyzeResultData, status_code=status.HTTP_200_OK)
async def analyze_intent(payload: AnalyzeRequest) -> AnalyzeResultData:
    """
    Responsibility 2: Explain AI decisions based on structured operator intent.
    Returns Problem Diagnosis, Strategy Action Plan, Explainable AI (XAI) Rationale, and Predicted Results.
    """
    intent = payload.intent

    if intent.event == "stadium_event":
        problem = ProblemData(
            title="Tower T7 & T8 Congestion",
            description="Cell tower T7 and adjacent tower T8 will experience severe spectral crowding exceeding 95% throughput capacity.",
            prediction_confidence=96,
            affected_users=28000,
        )
        strategy = StrategyData(
            title="Stadium Event Orchestration",
            actions=[
                "Deploy Stadium High-Density 5G Network Slice",
                "Offload non-essential traffic to Edge Server E2",
                "Reconfigure beamforming vectors on Tower T7 & T8",
                "Allocate +40MHz mmWave spectrum dynamically",
            ],
        )
        results = ResultsData(
            latency_before=45,
            latency_after=12,
            health_before=62,
            health_after=96,
            confidence=96,
        )
        reasoning = (
            "Predictive telemetry indicates a 3.4x spike in uplink video streams. Offloading background processes to "
            "Edge Server E2 frees 45% RF capacity on Tower T7, restoring sub-15ms latency across all active stadium slices."
        )

    elif intent.event == "concert_festival":
        problem = ProblemData(
            title="Uplink Throughput Bottleneck",
            description="Mass social media uploading is overwhelming macro-cell uplink queues, causing packet drops.",
            prediction_confidence=93,
            affected_users=19500,
        )
        strategy = StrategyData(
            title="High-Throughput Media Slice",
            actions=[
                "Instantiate Uplink-Boosted QoS Profile",
                "Activate CoMP (Coordinated Multi-Point) transmission",
                "Reroute backbone traffic through Edge Server E1",
                "Throttle non-priority background sync tasks",
            ],
        )
        results = ResultsData(
            latency_before=38,
            latency_after=16,
            health_before=70,
            health_after=94,
            confidence=93,
        )
        reasoning = (
            "CoMP activation enables adjacent micro-cells to pool uplink bandwidth, satisfying high video upload demand "
            "without degrading voice or critical telemetry streams."
        )

    elif intent.event == "emergency_earthquake":
        problem = ProblemData(
            title="Fiber Backhaul Degradation",
            description="Primary fiber backhaul degraded near sector B; emergency first responder communications at risk of packet drops.",
            prediction_confidence=99,
            affected_users=12000,
        )
        strategy = StrategyData(
            title="First Responder Priority Slice",
            actions=[
                "Isolate Priority 0 Emergency Communications Slice",
                "Failover backhaul to Satellite/Microwave redundant link",
                "Preempt low-priority commercial traffic",
                "Deploy dynamic Mesh routing across active towers",
            ],
        )
        results = ResultsData(
            latency_before=78,
            latency_after=8,
            health_before=42,
            health_after=98,
            confidence=99,
        )
        reasoning = (
            "Preempting commercial data slices guarantees 100% link availability for emergency services. Redundant microwave "
            "failover bypasses degraded fiber links with zero packet loss."
        )

    elif intent.event == "autonomous_traffic":
        problem = ProblemData(
            title="URLLC Latency Jitter Anomaly",
            description="Intermittent latency spikes on V2X safety channel threaten autonomous vehicle platooning synchronization.",
            prediction_confidence=97,
            affected_users=8500,
        )
        strategy = StrategyData(
            title="URLLC V2X Safety Orchestration",
            actions=[
                "Lock Ultra-Reliable Low-Latency (URLLC) Sub-1ms Slice",
                "Pin V2X control loops to local Edge Server E3",
                "Enforce strict priority queueing on transport layer",
                "Activate redundant dual-connectivity link paths",
            ],
        )
        results = ResultsData(
            latency_before=28,
            latency_after=4,
            health_before=78,
            health_after=99,
            confidence=97,
        )
        reasoning = (
            "Edge Server E3 local termination reduces round-trip time from 28ms to 4ms, ensuring real-time vehicle-to-infrastructure "
            "safety signaling under safety compliance limits."
        )

    elif intent.event == "cyber_attack":
        problem = ProblemData(
            title="Volumetric DDoS & Core Anomaly",
            description="Abnormal packet flood directed at Core Gateway G1 detected from external botnet IP ranges.",
            prediction_confidence=98,
            affected_users=24000,
        )
        strategy = StrategyData(
            title="Zero-Trust Threat Containment",
            actions=[
                "Trigger Autonomous BGP Blackholing on attacking IPs",
                "Isolate affected subnet into Zero-Trust Honeypot",
                "Reroute clean core traffic through Edge Firewall EF1",
                "Rotate cryptographic keys across inter-tower links",
            ],
        )
        results = ResultsData(
            latency_before=92,
            latency_after=15,
            health_before=35,
            health_after=95,
            confidence=98,
        )
        reasoning = (
            "Autonomous BGP filtering drops 99.8% of malicious ingress traffic at the border router, protecting core network "
            "resources and restoring normal operational latency."
        )

    else:
        problem = ProblemData(
            title="Tower T7 Capacity Bottleneck",
            description="Tower T7 is predicted to experience high utilization during peak operating hours.",
            prediction_confidence=91,
            affected_users=18000,
        )
        strategy = StrategyData(
            title="Dynamic Load Balancing Strategy",
            actions=[
                "Instantiate Dynamic Event Network Slice",
                "Redistribute active user sessions to Tower T9",
                "Scale compute allocation on Edge Server E2",
                "Optimize antenna tilt and power management",
            ],
        )
        results = ResultsData(
            latency_before=32,
            latency_after=14,
            health_before=85,
            health_after=97,
            confidence=91,
        )
        reasoning = (
            "Redistributing traffic across adjacent cell Tower T9 eliminates single-point congestion and optimizes system-wide RF efficiency."
        )

    return AnalyzeResultData(
        problem=problem,
        strategy=strategy,
        results=results,
        reasoning=reasoning,
    )
