from pydantic import BaseModel, Field
from typing import List, Optional

class IntentRequest(BaseModel):
    message: str = Field(..., description="Operator prompt text describing network intent")

class IntentData(BaseModel):
    event: str = Field(..., description="Internal event identifier")
    event_display: str = Field(..., description="Human-readable event name")
    goal: str = Field(..., description="Internal goal identifier")
    goal_display: str = Field(..., description="Human-readable goal name")
    priority: str = Field(..., description="Internal priority level")
    priority_display: str = Field(..., description="Human-readable priority name")
    estimated_users: int = Field(..., description="Estimated number of affected users")

class ProblemData(BaseModel):
    title: str = Field(..., description="Title of the detected problem/anomaly")
    description: str = Field(..., description="Detailed description of the network bottleneck or issue")
    prediction_confidence: int = Field(..., description="Confidence percentage of the predictive model")
    affected_users: int = Field(..., description="Number of users affected by the problem")

class StrategyData(BaseModel):
    title: str = Field(..., description="Title of the orchestration strategy")
    actions: List[str] = Field(..., description="List of concrete action items to execute")

class ResultsData(BaseModel):
    latency_before: int = Field(..., description="Latency before optimization in ms")
    latency_after: int = Field(..., description="Predicted latency after optimization in ms")
    health_before: int = Field(..., description="Network health score before optimization")
    health_after: int = Field(..., description="Predicted network health score after optimization")
    confidence: int = Field(..., description="Overall confidence percentage of predicted results")

class AnalyzeRequest(BaseModel):
    intent: IntentData = Field(..., description="Structured intent data from /api/chat/intent")

class AnalyzeResultData(BaseModel):
    problem: ProblemData
    strategy: StrategyData
    results: ResultsData
    reasoning: str = Field(..., description="Explainable AI rationale explaining why this strategy was chosen")

class SimulationRunRequest(BaseModel):
    strategy_title: str = Field(..., description="Title of the strategy to simulate")

class SimulationRunResponse(BaseModel):
    status: str = Field(..., description="Execution status")
    message: str = Field(..., description="Status summary message")
    simulation_id: str = Field(..., description="Unique simulation execution ID")
