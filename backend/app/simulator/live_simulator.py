import asyncio
import logging
from typing import Dict, Any
from fastapi.encoders import jsonable_encoder

from app.database.connection import SessionLocal
from app.services.snapshot_service import process_and_store_snapshot
from app.websocket.manager import manager

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
        "weather": random.choice(["clear", "rain", "storm"])
    }

async def live_simulator_task():
    """Background task that runs every second to simulate network behavior."""
    logger.info("Starting Live Simulator background task...")
    
    while True:
        await asyncio.sleep(1)
        
        try:
            # 1. Generate telemetry
            telemetry = generate_mock_telemetry()
            
            # 2. Process and store snapshot
            db = SessionLocal()
            try:
                # pipeline.run is synchronous, and process_and_store_snapshot does DB operations
                # To prevent blocking the async event loop, we ideally should run it in a threadpool
                # For simplicity, we can use run_in_executor
                loop = asyncio.get_event_loop()
                snapshot = await loop.run_in_executor(None, process_and_store_snapshot, db, telemetry)
                
                # 3. Broadcast to WebSockets
                # Prepare payload
                payload = {
                    "id": str(snapshot.id),
                    "timestamp": snapshot.timestamp.isoformat(),
                    "telemetry": snapshot.telemetry,
                    "prediction": snapshot.prediction,
                    "strategies": snapshot.strategies,
                    "simulation": snapshot.simulation
                }
                
                await manager.broadcast(payload)
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Live simulator error: {e}")
