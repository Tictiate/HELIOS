from fastapi import APIRouter

router = APIRouter(prefix="/telemetry", tags=["telemetry"])

@router.get("/")
async def get_telemetry() -> dict:
    return {"status": "Not Implemented"}
