from fastapi import APIRouter, status
from app.schemas.chat import SimulationRunRequest, SimulationRunResponse

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.get("/")
async def get_simulation() -> dict:
    """
    Get simulation module status.
    """
    return {"status": "Simulation Engine Active"}


@router.post("/run", response_model=SimulationRunResponse, status_code=status.HTTP_200_OK)
async def run_simulation(payload: SimulationRunRequest) -> SimulationRunResponse:
    """
    Run Digital Twin simulation for the selected AI strategy.
    """
    title = payload.strategy_title if payload.strategy_title else "Default Strategy"
    return SimulationRunResponse(
        status="success",
        message=f"Digital Twin simulation initiated for strategy: {title}",
        simulation_id="sim_exec_" + str(hash(title) % 100000),
    )
