# HELIOS API Documentation

## Chat & AI Operations Router (`/api/chat`)

### `POST /api/chat/intent`
Parses natural language operator prompt into structured network intent parameters.

- **Request Body**:
  ```json
  {
    "message": "Optimize network for stadium event"
  }
  ```
- **Response (200 OK)**: `IntentData`
  ```json
  {
    "event": "stadium_event",
    "event_display": "Stadium Event",
    "goal": "minimize_latency",
    "goal_display": "Minimize Latency",
    "priority": "high_bandwidth",
    "priority_display": "High Bandwidth Slicing",
    "estimated_users": 50000
  }
  ```

---

### `POST /api/chat/analyze`
Analyzes structured operator intent and returns Explainable AI (XAI) rationale, problem diagnosis, strategy actions, and predicted results.

- **Request Body**: `AnalyzeRequest`
  ```json
  {
    "intent": {
      "event": "stadium_event",
      "event_display": "Stadium Event",
      "goal": "minimize_latency",
      "goal_display": "Minimize Latency",
      "priority": "high_bandwidth",
      "priority_display": "High Bandwidth Slicing",
      "estimated_users": 50000
    }
  }
  ```
- **Response (200 OK)**: `AnalyzeResultData`
  ```json
  {
    "problem": {
      "title": "Tower T7 & T8 Congestion",
      "description": "Cell tower T7 and adjacent tower T8 will experience severe spectral crowding exceeding 95% throughput capacity.",
      "prediction_confidence": 96,
      "affected_users": 28000
    },
    "strategy": {
      "title": "Stadium Event Orchestration",
      "actions": [
        "Deploy Stadium High-Density 5G Network Slice",
        "Offload non-essential traffic to Edge Server E2",
        "Reconfigure beamforming vectors on Tower T7 & T8",
        "Allocate +40MHz mmWave spectrum dynamically"
      ]
    },
    "results": {
      "latency_before": 45,
      "latency_after": 12,
      "health_before": 62,
      "health_after": 96,
      "confidence": 96
    },
    "reasoning": "Predictive telemetry indicates a 3.4x spike in uplink video streams. Offloading background processes to Edge Server E2 frees 45% RF capacity on Tower T7, restoring sub-15ms latency across all active stadium slices."
  }
  ```

---

## Simulation Router (`/api/simulation`)

### `POST /api/simulation/run`
Initiates Digital Twin simulation for an AI orchestration strategy.

- **Request Body**:
  ```json
  {
    "strategy_title": "Stadium Event Orchestration"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Digital Twin simulation initiated for strategy: Stadium Event Orchestration",
    "simulation_id": "sim_exec_12345"
  }
  ```
