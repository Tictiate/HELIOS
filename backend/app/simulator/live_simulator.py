"""
live_simulator.py — Background task that drives the HELIOS decision loop.

Every second:
  1. Generate telemetry
  2. Run Pipeline + Autonomous Executor (via snapshot_service)
  3. Persist snapshot + execution record
  4. Broadcast updated state to WebSocket clients
"""

import asyncio
import logging
from typing import Dict, Any

from app.database.connection import SessionLocal
from app.services.snapshot_service import process_and_store_snapshot
from app.websocket.manager import manager
from app.services.scenario_engine import manager as scenario_manager, engine as scenario_engine
from app.schemas.scenario import ScenarioHistoryCreate
from app.crud.scenario import create_scenario_history
import copy

logger = logging.getLogger(__name__)


def generate_mock_telemetry() -> Dict[str, Any]:
    """Generates a mock network telemetry snapshot for the simulator, including Network Slices."""
    import random
    
    total_users = random.randint(100, 1000)
    tower_capacity = 100.0
    
    # We maintain persistent mock state for users to avoid jitter, but for simplicity here we just randomize
    emergency_users = int(total_users * random.uniform(0.01, 0.05))
    voice_users = int(total_users * random.uniform(0.1, 0.2))
    iot_devices = int(total_users * random.uniform(0.2, 0.3))
    gaming_users = int(total_users * random.uniform(0.1, 0.2))
    video_users = total_users - (emergency_users + voice_users + iot_devices + gaming_users)
    
    # Demand calculation (deterministic based on users)
    # Configurable demand factors per user type
    demand_factors = {
        "Emergency": 0.5, # 0.5 Mbps per user
        "Voice": 0.1,     # 0.1 Mbps per user
        "IoT": 0.01,      # 0.01 Mbps per device
        "Gaming": 0.3,    # 0.3 Mbps per user
        "Video": 1.0,     # 1.0 Mbps per user
    }
    
    demands = {
        "Emergency": emergency_users * demand_factors["Emergency"],
        "Voice": voice_users * demand_factors["Voice"],
        "IoT": iot_devices * demand_factors["IoT"],
        "Gaming": gaming_users * demand_factors["Gaming"],
        "Video": video_users * demand_factors["Video"],
    }
    
    # Static Default Allocations (Simulator base behavior without AI intervention)
    allocations = {
        "Emergency": 10.0,
        "Voice": 15.0,
        "IoT": 10.0,
        "Gaming": 25.0,
        "Video": 40.0,
    }
    
    # Slice metadata
    slice_meta = {
        "Emergency": {"type": "emergency", "priority": "CRITICAL", "min": 5.0, "max": 30.0, "lat_tgt": 10.0, "pl_tgt": 0.1, "users": emergency_users},
        "Voice": {"type": "voice", "priority": "HIGH", "min": 5.0, "max": 20.0, "lat_tgt": 50.0, "pl_tgt": 1.0, "users": voice_users},
        "IoT": {"type": "iot", "priority": "HIGH", "min": 2.0, "max": 15.0, "lat_tgt": 100.0, "pl_tgt": 2.0, "users": iot_devices},
        "Gaming": {"type": "gaming", "priority": "MEDIUM", "min": 10.0, "max": 35.0, "lat_tgt": 20.0, "pl_tgt": 0.5, "users": gaming_users},
        "Video": {"type": "video", "priority": "NORMAL", "min": 10.0, "max": 60.0, "lat_tgt": 100.0, "pl_tgt": 1.0, "users": video_users},
    }
    
    slices = []
    total_alloc = 0
    for name, meta in slice_meta.items():
        alloc = allocations[name]
        demand = demands[name]
        total_alloc += alloc
        
        # Calculate simulated latency and packet loss based on allocation vs demand
        # If demand > allocation, performance degrades exponentially
        ratio = demand / alloc if alloc > 0 else 999.0
        
        if ratio <= 0.8:
            # Under provisioned nicely
            lat = meta["lat_tgt"] * 0.5
            pl = meta["pl_tgt"] * 0.1
        elif ratio <= 1.0:
            # Near capacity
            lat = meta["lat_tgt"] * (ratio)
            pl = meta["pl_tgt"] * (ratio)
        else:
            # Over capacity
            lat = meta["lat_tgt"] * (ratio ** 2)
            pl = meta["pl_tgt"] * (ratio ** 2)
            
        lat = round(lat, 2)
        pl = round(min(100.0, pl), 2)
        
        # Determine SLA Status
        status = "HEALTHY"
        if lat > meta["lat_tgt"] * 1.5 or pl > meta["pl_tgt"] * 1.5:
            status = "VIOLATION"
        elif lat > meta["lat_tgt"] or pl > meta["pl_tgt"]:
            status = "DEGRADED"
            
        slices.append({
            "slice_id": f"slice_{name.lower()}",
            "name": name,
            "slice_type": meta["type"],
            "priority": meta["priority"],
            "allocated_bandwidth_mbps": alloc,
            "minimum_bandwidth_mbps": meta["min"],
            "maximum_bandwidth_mbps": meta["max"],
            "active_users": meta["users"],
            "current_demand_mbps": round(demand, 2),
            "current_latency_ms": lat,
            "current_packet_loss_pct": pl,
            "latency_target_ms": meta["lat_tgt"],
            "packet_loss_target_pct": meta["pl_tgt"],
            "status": status
        })
        
    # Overall metrics derived from slices for consistency
    avg_latency = sum(s["current_latency_ms"] for s in slices) / len(slices)
    avg_pl = sum(s["current_packet_loss_pct"] for s in slices) / len(slices)

    return {
        "tower_id": "T1",
        "users": total_users,
        "available_bandwidth_mbps": round(tower_capacity, 2),
        "latency_ms": round(avg_latency, 2),
        "packet_loss_pct": round(avg_pl, 2),
        "power_usage_pct": round(random.uniform(40.0, 60.0), 2),
        "temperature_c": round(random.uniform(35.0, 45.0), 2),
        "cpu_usage_pct": round(random.uniform(30.0, 60.0), 2),
        "traffic_load": round(sum(demands.values()) / tower_capacity, 2),
        "weather": "clear",
        "emergency_users": emergency_users,
        "slices": slices
    }


async def live_simulator_task():
    """Background task that runs every second to simulate network behavior."""
    logger.info("Starting Live Simulator background task...")

    while True:
        await asyncio.sleep(1)

        try:
            # 1. Generate telemetry
            telemetry = generate_mock_telemetry()

            db = SessionLocal()
            try:
                # 2. Check for scenario injections
                pending_scenario = scenario_manager.pop_pending_scenario()
                scenario_metadata = None

                if pending_scenario:
                    telemetry_before = copy.deepcopy(telemetry)
                    telemetry = scenario_engine.apply_scenario(pending_scenario, telemetry)
                    scenario_metadata = scenario_engine.generate_metadata(pending_scenario, telemetry_before, telemetry)
                    
                    # Persist scenario event
                    scenario_create = ScenarioHistoryCreate(
                        scenario_id=scenario_metadata["scenario_id"],
                        scenario_name=scenario_metadata["scenario_name"],
                        affected_towers=scenario_metadata["affected_towers"],
                        affected_edges=scenario_metadata["affected_edges"],
                        severity=scenario_metadata["severity"],
                        snapshot_before=telemetry_before,
                        snapshot_after=telemetry
                    )
                    # We run persistence synchronously here since it's light, but using the executor is safer
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, create_scenario_history, db, scenario_create)

                # 3. Process: Pipeline → Executor → Persist
                loop = asyncio.get_event_loop()
                snapshot, execution_result, explanation_result = await loop.run_in_executor(
                    None, process_and_store_snapshot, db, telemetry,
                )

                # 4. Broadcast to WebSocket clients
                report = execution_result.get("execution_report", {})
                updated_state = execution_result.get("updated_state", {})

                payload = {
                    "id": str(snapshot.id),
                    "timestamp": snapshot.timestamp.isoformat(),
                    "telemetry": updated_state,
                    "prediction": snapshot.prediction,
                    "strategies": snapshot.strategies,
                    "simulation": snapshot.simulation,
                    "execution": report,
                    "explainability": explanation_result,
                    "scenario": scenario_metadata,
                }

                await manager.broadcast(payload)

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Live simulator error: {e}", exc_info=True)
