# HELIOS – AI-Native Autonomous Network Operating System

> An AI-native Network Operating System for future 6G networks that autonomously understands operator intent, predicts network conditions, simulates strategies in a Digital Twin, and optimizes network resources in real time.

---

# Problem Statement

Future 6G networks will connect billions of devices including autonomous vehicles, IoT sensors, drones, smart cities, industrial systems, and edge AI applications. Traditional network management relies heavily on manual configuration and reactive monitoring, making it difficult to handle dynamic traffic, failures, and changing user demands efficiently.

Current network operations face several challenges:

- Manual intervention during network failures
- Slow response to traffic congestion
- Inefficient resource utilization
- Limited automation and scalability
- Lack of intent-based management
- Minimal explainability in AI-driven decisions

As networks become increasingly complex, autonomous and intelligent management is essential.

---

# Solution

HELIOS is an AI-Native Autonomous Network Operating System designed for next-generation 6G infrastructure.

Instead of manually configuring network parameters, operators simply specify high-level goals in natural language.

Example:

> "Optimize the network for a stadium event."

HELIOS automatically:

- Understands operator intent from natural-language prompts (rule-based today; LLM-backed parsing is on the roadmap)
- Builds structured network objectives
- Predicts congestion and failures
- Simulates multiple optimization strategies in a Digital Twin
- Selects the optimal strategy
- Applies autonomous network decisions
- Explains every action using Explainable AI

The project demonstrates how future AI-native networks can become self-managing through predictive intelligence and autonomous orchestration.

---

# Architecture Diagram

```text
                    User
                      │
          Natural Language Intent
                      │
                      ▼
             Intent Understanding
                (LLM Parser)
                      │
                      ▼
          Structured Network Goals
                      │
                      ▼
         Network State Intelligence
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Prediction Engine          Health Monitor
        │                           │
        └─────────────┬─────────────┘
                      ▼
          Autonomous Strategy Planner
                      │
                      ▼
            Digital Twin Simulator
                      │
                      ▼
         Multi-objective Optimizer
                      │
                      ▼
         Autonomous Decision Engine
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Traffic AI     Slice Manager    Edge Optimizer
                      │
                      ▼
            Explainable AI Module
                      │
                      ▼
         Visualization Dashboard
                      │
                      ▼
          Closed-loop Feedback System
```

---

# Tech Stack

## Frontend

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Cytoscape.js (network topology graph)
- Chart.js

## Backend

- FastAPI
- Python
- SQLAlchemy + Alembic (migrations)

## Artificial Intelligence

- Scikit-learn (congestion & failure prediction models)
- Rule-based strategy planner, optimizer, and explainability layer
- Intent/chat understanding is currently keyword/rule-based, not a live LLM integration (no Gemini/OpenAI call is made yet)

## Simulation

- Custom digital-twin simulator (`simulator/digital_twin/`) driving state transitions, forecasting, and scenario injection
- Synthetic Telecom Dataset

## Database

- PostgreSQL (Neon-hosted in the current deployment; `docker-compose.yaml` provisions a local Postgres 16 container for development)

## Development

- Git
- GitHub
- REST APIs + WebSockets
- Postman

---

# Repository Structure

```text
HELIOS/
│
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── CONTRIBUTING.md
├── PROJECT_STATE.md
├── docker-compose.yaml       # local Postgres service
├── .gitignore
│
├── docs/
│   ├── api.md
│   ├── frontend/
│   └── research/
│
├── frontend/
│   └── src/
│       ├── components/       # dashboard panels, topology, charts, chat UI
│       ├── context/          # SimulationContext (WS state, adapters)
│       ├── services/         # REST/WebSocket clients + adapters
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── backend/
│   └── app/
│       ├── api/               # routers: network, devices, topology, telemetry,
│       │                      #   alerts, predictions, simulation, scenario, chat, ws
│       ├── models/            # SQLAlchemy models
│       ├── schemas/           # Pydantic request/response schemas
│       ├── crud/
│       ├── services/          # snapshot processing, scenario engine, autonomous executor
│       ├── simulator/         # live_simulator background task
│       ├── websocket/         # connection manager
│       ├── database/
│       └── main.py
│
├── ai_engine/
│   ├── prediction/            # congestion/failure model training & inference
│   ├── models/                # trained .pkl model artifacts
│   ├── decision/              # strategy planner, planning rules, strategy library
│   └── optimizer/             # multi-objective scoring, ranking, constraints
│
├── pipeline/                  # orchestrates prediction -> planning -> optimization -> execution
│
├── simulator/
│   └── digital_twin/          # state transitions, forecasting, scenario runner, metrics
│
├── datasets/
│   ├── NEXUS_Synthetic_Datasets.xlsx
│   ├── processed/
│   └── synthetic/
│
├── tests/
└── reports/
```

---

# Quick Start

## Clone Repository

```bash
git clone https://github.com/yourusername/HELIOS.git

cd HELIOS
```

## Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env      # then set your PostgreSQL connection string

alembic upgrade head

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

See `backend/README.md` for Docker instructions.

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Open your browser:

```
http://localhost:5173
```

Backend API:

```
http://localhost:8000
```

---

# Folder Responsibilities

## frontend/

Responsible for:

- Dashboard
- Network visualization
- User interaction
- Chat interface
- Metrics
- Charts

---

## backend/

Responsible for:

- REST APIs + WebSocket streaming
- Chat/intent endpoint (currently rule-based, not an LLM)
- Authentication (future)
- Database (models, CRUD, Alembic migrations)
- Explainability service
- Business logic and integration with `ai_engine/`, `simulator/`, and `pipeline/`

---

## ai_engine/

Responsible for:

- Congestion prediction
- Failure prediction
- Strategy planning and decision rules
- Multi-objective strategy optimization (scoring, ranking, constraints)

---

## pipeline/

Responsible for:

- Orchestrating the end-to-end loop: prediction → strategy planning → digital-twin simulation → optimization → autonomous execution

---

## simulator/

Responsible for:

- Digital Twin state transitions
- Forecasting
- Scenario injection and execution (traffic surge, tower/fiber/power failures, DDoS, weather events, etc.)

---

## datasets/

Contains

- Synthetic telecom traffic (NEXUS synthetic dataset)
- Processed and synthetic data splits used by the prediction models

---

## docs/

Contains

- API reference (`api.md`)
- Frontend documentation
- Research notes

---

# API Overview

None of the routes below are namespaced under `/api` — they're mounted directly on the app root (e.g. `http://localhost:8000/towers`, not `/api/towers`).

## Network State

```http
GET /towers
GET /towers/{id}
GET /towers/{id}/utilization
GET /towers/{id}/traffic
GET /towers/{id}/failures
GET /towers/{id}/slices
GET /edges
GET /edges/{id}/telemetry
GET /network-health
GET /latest              # most recent snapshot (telemetry, prediction, strategies, execution)
GET /history
```

---

## AI Loop History

```http
GET /executions/latest
GET /executions/history
GET /explain/latest      # explainability rationale for the most recent decision
```

---

## Scenario Injection

```http
GET  /scenarios                # list available scenario names
POST /scenarios/inject
POST /scenarios/schedule
POST /scenarios/random/start
POST /scenarios/random/stop
GET  /scenarios/history
```

---

## Devices

```http
GET    /devices
POST   /devices
GET    /devices/{id}
PUT    /devices/{id}
DELETE /devices/{id}
```

---

## Chat

```http
POST /chat/intent
POST /chat/analyze
```

Currently rule-based keyword matching against a fixed set of scenarios — not a live LLM call.

---

## Real-time Stream

```http
WS /ws/network
```

Broadcasts a full snapshot (telemetry, prediction, strategy, execution, explainability, active scenario) roughly once per second to every connected client.

---

# Development Workflow

We follow a feature-branch workflow.

```text
main
│
├── frontend
├── backend
├── ai_engine
└── simulator
```

Development process:

1. Create a feature branch
2. Implement the feature
3. Test locally
4. Open a Pull Request
5. Code review
6. Merge into `main`

---

# Deployment

Current deployment target:

Frontend

- Vercel

Backend

- Render / Railway

Database

- PostgreSQL (Neon)

Future production deployment:

- Docker (a `docker-compose.yaml` for local Postgres already exists at the repo root)
- Kubernetes
- Redis
- Prometheus
- Grafana

---

# Known Limitations

- Uses synthetic telecom datasets
- Prototype-scale network simulation, scoped to a single simulated tower
- No integration with real telecom hardware
- Chat/intent understanding is rule-based keyword matching, not a live LLM
- Simplified routing and orchestration logic
- Single-node deployment

---

# Future Scope

- Real-time telecom telemetry integration
- Live LLM-backed intent understanding for the chat interface
- Reinforcement Learning for autonomous optimization
- Multi-agent AI orchestration
- Open RAN integration
- SDN controller support
- Network-wide (multi-tower) slice orchestration — slicing today is scoped to a single simulated tower
- Kubernetes-based deployment
- Federated learning across edge nodes
- Real-time anomaly detection
- Large-scale distributed Digital Twin
- Production-grade monitoring and observability
- Support for real 5G/6G network infrastructure

---

## Team

HELIOS is developed as a research-oriented hackathon project exploring the future of AI-native autonomous networking for next-generation 6G communication systems.

---

## License

Intended to be released under the MIT License — no `LICENSE` file has been added to the repository yet.