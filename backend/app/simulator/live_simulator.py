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
    """Generates a mock network telemetry snapshot for the simulator."""
    import random
    return {
        "tower_id": "T_SIM_01",
        "users": random.randint(100, 1000),
        "available_bandwidth_mbps": round(random.uniform(10.0, 100.0), 2),
        "latency_ms": round(random.uniform(5.0, 100.0), 2),
        "packet_loss_pct": round(random.uniform(0.0, 5.0), 2),
        "power_usage_pct": round(random.uniform(20.0, 90.0), 2),
        "temperature_c": round(random.uniform(20.0, 60.0), 2),
        "cpu_usage_pct": round(random.uniform(10.0, 95.0), 2),
        "traffic_load": round(random.uniform(0.1, 1.0), 2),
        "weather": random.choice(["clear", "rain", "storm"]),
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
