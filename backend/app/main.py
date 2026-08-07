from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.api.api_router import api_router
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers
from app.api.ws import router as ws_router
from app.simulator.live_simulator import live_simulator_task
import asyncio
logger = logging.getLogger("helios")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info("Starting HELIOS Backend...")
    
    # Start live simulator background task
    simulator_task = asyncio.create_task(live_simulator_task())
    
    yield
    # Shutdown
    logger.info("Shutting down HELIOS Backend...")
    simulator_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Native Autonomous Network Operating System",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "environment": settings.ENVIRONMENT}

app.include_router(api_router)
app.include_router(ws_router)
