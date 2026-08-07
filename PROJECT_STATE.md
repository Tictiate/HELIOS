# PROJECT_STATE.md

# HELIOS – AI-Native Autonomous Network Operating System

Last Updated: August 2026

---

# Project Vision

HELIOS is an AI-Native Autonomous Network Operating System designed for future 6G networks.

Instead of manually configuring networking infrastructure, operators describe high-level goals in natural language.

Example:

> "Optimize the network for a stadium event."

HELIOS autonomously:

- Understands operator intent
- Predicts network behavior
- Simulates multiple optimization strategies
- Chooses the optimal plan
- Applies autonomous actions
- Explains every decision
- Continuously monitors network health through a closed feedback loop

The project demonstrates the future of autonomous telecom infrastructure using AI, Digital Twins, and predictive analytics.

---

# Current Development Status

Overall Progress

⬜ Planning
🟩 Architecture
🟨 Backend
🟨 Frontend
🟨 AI Engine
⬜ Integration
⬜ Testing
⬜ Deployment

Current Phase

Architecture & Core Module Development

---

# Core Modules

## 1. Intent Engine

Status

🟨 In Progress

Purpose

Convert natural language into structured network objectives.

Example

Input

```
Prioritize emergency communication.
```

Output

```json
{
  "priority": "Emergency",
  "reserveBandwidth": 30,
  "enableEmergencySlice": true
}
```

Dependencies

- Gemini API / OpenAI
- FastAPI

---

## 2. Network State Intelligence

Status

⬜ Not Started

Purpose

Maintain a real-time representation of the current network state.

Tracks

- Tower utilization
- Active users
- Latency
- Packet loss
- Bandwidth
- Power usage
- Failure probability
- Health score

---

## 3. Prediction Engine

Status

🟨 In Progress

Purpose

Predict:

- Congestion
- Tower overload
- Link failures
- Demand spikes

Planned Models

- Random Forest
- XGBoost

Input

Synthetic telecom metrics

Output

```json
{
  "tower": "Tower C",
  "congestionProbability": 0.92
}
```

---

## 4. Strategy Planner

Status

⬜ Not Started

Purpose

Generate multiple optimization strategies.

Example

Plan A

Increase bandwidth

Plan B

Create new network slice

Plan C

Move edge services

Each plan will be evaluated inside the Digital Twin before deployment.

---

## 5. Digital Twin

Status

🟨 In Progress

Purpose

Virtual representation of the telecom network.

Contains

- Towers
- Users
- Base stations
- Edge servers
- Hospitals
- Emergency services

Each node stores

- Latency
- CPU
- Power
- Users
- Health score
- Failure probability

---

## 6. Decision Engine

Status

⬜ Not Started

Purpose

Select the optimal strategy.

Possible actions

- Create slices
- Route traffic
- Activate backup towers
- Migrate edge workloads
- Allocate bandwidth

---

## 7. Explainable AI

Status

⬜ Not Started

Purpose

Explain every autonomous decision.

Example

```
Tower C predicted to overload.

Confidence: 92%

Traffic redirected to Tower D.

Expected latency improvement:
63ms → 19ms.
```

---

## 8. Dashboard

Status

🟨 In Progress

Displays

- Network topology
- Health score
- Active slices
- Traffic heatmap
- AI reasoning
- Chat interface
- Alerts
- Predictions

---

# Planned Architecture

```
User
 │
 ▼
Intent Engine
 │
 ▼
Structured Goals
 │
 ▼
Network State Intelligence
 │
 ▼
Prediction Engine
 │
 ▼
Strategy Planner
 │
 ▼
Digital Twin
 │
 ▼
Decision Engine
 │
 ▼
Explainable AI
 │
 ▼
Dashboard
 │
 ▲
 └────────── Closed Feedback Loop
```

---

# Tech Stack

Frontend

- React
- Tailwind CSS
- Cytoscape.js
- Chart.js

Backend

- FastAPI
- Python

AI

- Gemini API
- Scikit-learn
- XGBoost

Simulation

- NetworkX

Database

- SQLite

---

# Repository Structure

```
frontend/
backend/
ai_engine/
simulator/
datasets/
docs/
infrastructure/
```

---

# Current Priorities

Priority 1

Build Digital Twin

Priority 2

Create synthetic dataset

Priority 3

Implement Prediction Engine

Priority 4

Connect FastAPI APIs

Priority 5

Develop React dashboard

Priority 6

Integrate all modules

---

# Pending Tasks

## AI

- Intent parser
- Congestion prediction
- Failure prediction
- Strategy planner
- Explainability

---

## Backend

- FastAPI project structure
- REST APIs
- Database integration

---

## Frontend

- Dashboard
- Chat interface
- Graph visualization
- Charts
- Metrics

---

## Simulation

- Network graph
- Routing
- Traffic generation
- Disaster simulation
- Congestion simulation

---

# Demo Scenarios

## Scenario 1

Concert

Expected Result

- Predict congestion
- Create slices
- Reduce latency

---

## Scenario 2

Earthquake

Expected Result

- Detect failures
- Activate backup towers
- Route emergency traffic

---

## Scenario 3

Cyber Attack

Expected Result

- Detect anomalies
- Isolate malicious nodes
- Protect legitimate traffic

---

# Team Responsibilities

Member 1

AI & Prediction

- ML models
- Explainability
- Strategy Planner

---

Member 2

Simulation

- Digital Twin
- Routing
- Network graph

---

Member 3

Backend

- FastAPI
- APIs
- Database

---

Member 4

Frontend

- React
- Dashboard
- Visualization

---

# Coding Standards

Backend

- Python 3.12+
- Type hints required
- Pydantic models
- Modular architecture

Frontend

- Functional React components
- Tailwind only
- Component-based design

General

- Feature branches
- Meaningful commits
- Clear documentation
- Small pull requests

---

# Definition of Done

A feature is considered complete when:

- Functionality works as expected
- Code is documented
- API is tested
- Frontend integration is complete
- No major bugs remain
- README is updated
- Team members understand the implementation

---

# Future Enhancements

- Reinforcement Learning
- Multi-agent orchestration
- Real telecom APIs
- Open RAN support
- Kubernetes deployment
- Distributed Digital Twin
- Live telemetry
- Federated Learning
- 6G Network Slice Orchestration

---

# Notes

This repository is intended as a research-oriented prototype demonstrating AI-native autonomous networking concepts rather than a production-ready telecom operating system.

The focus is on showcasing autonomous decision-making, digital twin simulation, explainable AI, and intent-based networking in an educational and hackathon setting.