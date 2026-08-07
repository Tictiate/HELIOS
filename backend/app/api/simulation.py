from fastapi import APIRouter

router = APIRouter(prefix="/simulation", tags=["simulation"])

@router.get("/")
async def get_simulation() -> dict:
    return {"status": "Not Implemented"}
