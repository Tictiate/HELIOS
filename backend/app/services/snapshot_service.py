"""
snapshot_service.py — Service layer for network snapshot processing.

Orchestrates: Telemetry → Pipeline → Executor → Persist → Return.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Tuple

import sys
import os

# Add root directory to path to allow importing pipeline
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from pipeline.helios_pipeline import HeliosPipeline
from app.services.autonomous_executor import helios_execute
from app.crud.snapshot import create_snapshot
from app.crud.execution import create_execution
from app.schemas.snapshot import NetworkSnapshotCreate
from app.schemas.execution import ExecutionHistoryCreate
from app.schemas.explainability import ExplainabilityHistoryCreate
from app.models.snapshot import NetworkSnapshot
from app.services.explainability_service import generate_explanations
from app.crud.explainability import create_explainability

pipeline = HeliosPipeline()


def process_and_store_snapshot(
    db: Session, telemetry_data: Dict[str, Any],
) -> Tuple[NetworkSnapshot, Dict[str, Any], Dict[str, Any]]:
    """
    Executes the full HELIOS decision loop:
      1. Run the AI Pipeline (predict → plan → simulate → optimize)
      2. Autonomously execute the best strategy
      3. Generate explanations for the AI decisions
      4. Persist the pipeline snapshot, execution record, and explanations
      5. Return the DB snapshot, execution result, and explanation data

    Returns:
        (db_snapshot, execution_result, explanation_result)
    """
    # ── 1. Run AI Pipeline ────────────────────────────────────────────────
    pipeline_result = pipeline.run(telemetry_data)

    # ── 2. Autonomous Execution ───────────────────────────────────────────
    current_state = pipeline_result.get("current_state", {})
    optimization = pipeline_result.get("optimization", {})

    execution_result = helios_execute(current_state, optimization)
    report = execution_result.get("execution_report", {})
    updated_state = execution_result.get("updated_state", current_state)

    # ── 3. Persist Pipeline Snapshot ──────────────────────────────────────
    snapshot_create = NetworkSnapshotCreate(
        telemetry=updated_state,
        prediction=pipeline_result.get("prediction", {}),
        strategies=pipeline_result.get("strategies", {}),
        simulation=pipeline_result.get("simulation", {}),
    )
    db_snapshot = create_snapshot(db=db, snapshot=snapshot_create)

    # ── 4. Persist Execution Record ───────────────────────────────────────
    exec_create = ExecutionHistoryCreate(
        strategy=report.get("strategy", "None"),
        execution_status=report.get("status", "unknown"),
        execution_time_ms=report.get("execution_time_ms", 0.0),
        snapshot_before=current_state,
        snapshot_after=updated_state,
        improvement_score=report.get("improvement_score", 0.0),
        changed_metrics=report.get("changed_metrics", {}),
    )
    create_execution(db=db, execution=exec_create)
    
    # ── 4.5 Persist Network Slices ───────────────────────────────────────
    from app.models.network import NetworkSlice
    slices_data = updated_state.get("slices", [])
    for slice_data in slices_data:
        # Check if exists
        existing = db.query(NetworkSlice).filter(
            NetworkSlice.slice_id == slice_data["slice_id"]
        ).first()
        if existing:
            for k, v in slice_data.items():
                setattr(existing, k, v)
        else:
            new_slice = NetworkSlice(**slice_data)
            new_slice.tower_id = updated_state.get("tower_id", "T1")
            db.add(new_slice)
    db.commit()

    # ── 5. Generate and Persist Explanations ──────────────────────────────
    explanation_result = generate_explanations(
        current_state=current_state,
        prediction_output=pipeline_result.get("prediction", {}),
        strategy_evaluation=optimization,
        digital_twin_simulation=pipeline_result.get("simulation", {}),
        execution_report=report,
    )
    explain_create = ExplainabilityHistoryCreate(
        snapshot_id=db_snapshot.id,
        prediction_explanation=explanation_result.get("prediction_explanation", {}),
        strategy_explanation=explanation_result.get("strategy_explanation", {}),
        simulation_explanation=explanation_result.get("simulation_explanation", {}),
        execution_explanation=explanation_result.get("execution_explanation", {}),
        helios_insight=explanation_result.get("helios_insight", ""),
    )
    create_explainability(db=db, explainability=explain_create)

    return db_snapshot, execution_result, explanation_result
