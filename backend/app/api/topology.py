from fastapi import APIRouter

router = APIRouter(prefix="/topology", tags=["topology"])

@router.get("/")
async def get_topology() -> dict:
    return {"status": "Not Implemented"}
