"""
API endpoints for Scenario Injection.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from app.database.connection import get_db
from app.services.scenario_engine import manager, AVAILABLE_SCENARIOS
from app.schemas.scenario import (
    ScenarioInjectRequest, 
    ScenarioScheduleRequest, 
    ScenarioHistoryResponse
)
from app.crud.scenario import get_scenario_history

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=List[str])
def list_scenarios():
    """Lists all available scenarios for injection."""
    return list(AVAILABLE_SCENARIOS.keys())


@router.post("/inject")
def inject_scenario(request: ScenarioInjectRequest):
    """Manually inject a scenario for immediate execution in the next tick."""
    success = manager.inject_manual(request.scenario_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Unknown scenario '{request.scenario_name}'"
        )
    return {"message": f"Scenario '{request.scenario_name}' queued for injection."}


@router.post("/schedule")
def schedule_scenario(request: ScenarioScheduleRequest):
    """Schedules a scenario for execution in the future."""
    execute_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=request.execute_in_seconds)
    success = manager.schedule(request.scenario_name, execute_at)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Unknown scenario '{request.scenario_name}'"
        )
    return {
        "message": f"Scenario '{request.scenario_name}' scheduled.",
        "execute_at": execute_at.isoformat() + "Z"
    }


@router.post("/random/start")
def start_random_injection():
    """Enables random scenario injection in the simulator."""
    manager.enable_random()
    return {"message": "Random scenario injection enabled."}


@router.post("/random/stop")
def stop_random_injection():
    """Disables random scenario injection in the simulator."""
    manager.disable_random()
    return {"message": "Random scenario injection disabled."}


@router.get("/history", response_model=List[ScenarioHistoryResponse])
def get_history(limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves the history of injected scenarios."""
    return get_scenario_history(db, limit=limit)
