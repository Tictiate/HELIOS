from fastapi import APIRouter

from app.api import devices, topology, telemetry, alerts, predictions, simulation, network, scenario

api_router = APIRouter()

api_router.include_router(network.router)
api_router.include_router(devices.router)
api_router.include_router(topology.router)
api_router.include_router(telemetry.router)
api_router.include_router(alerts.router)
api_router.include_router(predictions.router)
api_router.include_router(simulation.router)
api_router.include_router(scenario.router)
