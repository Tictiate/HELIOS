from fastapi import APIRouter

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/")
async def get_predictions() -> dict:
    return {"status": "Not Implemented"}
