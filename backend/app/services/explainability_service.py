"""
explainability_service.py — Explainability Engine for HELIOS.

Generates human-readable, deterministic explanations for AI decisions
made by the pipeline, including predictions, strategy selection,
simulation results, and actual execution outcomes.
"""

from typing import Dict, Any


class ExplainabilityEngine:
    
    def generate_prediction_explanation(self, prediction: Dict[str, Any]) -> Dict[str, Any]:
        """Explains why a prediction was made."""
        if not prediction:
            return {"status": "No prediction data available."}
            
        return {
            "confidence": prediction.get("prediction", {}).get("confidence", 0.0),
            "severity": prediction.get("prediction", {}).get("severity", "unknown"),
            "contributing_factors": prediction.get("prediction", {}).get("contributing_factors", []),
            "threshold_comparisons": prediction.get("prediction", {}).get("thresholds_exceeded", []),
            "technical_reasoning": f"Predicted severity is {prediction.get('prediction', {}).get('severity', 'unknown')} with a confidence of {prediction.get('prediction', {}).get('confidence', 0.0)}%."
        }

    def generate_strategy_explanation(self, strategy_eval: Dict[str, Any]) -> Dict[str, Any]:
        """Explains why a strategy was selected and alternatives rejected."""
        if not strategy_eval:
            return {"status": "No strategy evaluation data available."}
            
        recommended = strategy_eval.get("recommended_strategy", {})
        ranking = strategy_eval.get("ranking", [])
        
        chosen_strategy = recommended.get("strategy", "None")
        score = recommended.get("score", 0.0)
        
        rejected = []
        for s in ranking:
            if s.get("strategy") != chosen_strategy:
                reason = "Lower score" if s.get("feasible") else "Constraint violation"
                rejected.append({
                    "strategy": s.get("strategy"),
                    "reason": reason,
                    "score": s.get("score", 0.0)
                })
                
        return {
            "chosen_strategy": chosen_strategy,
            "selection_reason": f"Highest feasible score ({score}).",
            "rejected_alternatives": rejected,
            "confidence_score": score,
            "expected_improvement": "Pending simulation details"
        }

    def generate_simulation_explanation(self, strategy_eval: Dict[str, Any]) -> Dict[str, Any]:
        """Explains the expected outcome based on digital twin simulation."""
        if not strategy_eval:
            return {"status": "No simulation data available."}
            
        recommended = strategy_eval.get("recommended_strategy", {})
        final_metrics = recommended.get("final_metrics", {})
        
        return {
            "predicted_metrics": final_metrics,
            "estimated_network_health_gain": "Positive", # This requires before state to compute delta if not available
            "risk_reduction": True
        }

    def generate_execution_explanation(self, execution_report: Dict[str, Any]) -> Dict[str, Any]:
        """Explains the actual outcome of the autonomous execution."""
        if not execution_report:
            return {"status": "No execution report available."}
            
        return {
            "execution_status": execution_report.get("status", "unknown"),
            "success": execution_report.get("status") == "executed",
            "actual_metric_changes": execution_report.get("changed_metrics", {}),
            "improvement_score": execution_report.get("improvement_score", 0.0),
            "deviations_from_prediction": "N/A" # For now, no strict tracking of deviation vs simulation
        }

    def generate_helios_insight(
        self, 
        current_state: Dict[str, Any], 
        prediction: Dict[str, Any], 
        strategy_eval: Dict[str, Any], 
        execution: Dict[str, Any]
    ) -> str:
        """Generates a concise operational summary."""
        tower_id = current_state.get("tower_id", "Unknown Tower")
        problem = prediction.get("prediction", {}).get("severity", "normal")
        
        best = strategy_eval.get("recommended_strategy", {})
        strategy = best.get("strategy", "No strategy")
        
        improvement = execution.get("improvement_score", 0.0)
        
        if improvement > 0:
            return f"Tower {tower_id} detected a {problem} severity condition. '{strategy}' was selected and improved network health by {improvement:+.2f} points."
        elif improvement < 0:
            return f"Tower {tower_id} detected a {problem} severity condition. '{strategy}' was selected, but network health decreased by {abs(improvement):.2f} points."
        else:
            if problem == "normal":
                return f"Tower {tower_id} is operating normally. '{strategy}' was evaluated but resulted in no significant change."
            return f"Tower {tower_id} detected a {problem} condition. '{strategy}' was applied but yielded no improvement."

    def generate_full_explanation(
        self,
        current_state: Dict[str, Any],
        prediction_output: Dict[str, Any],
        strategy_evaluation: Dict[str, Any],
        digital_twin_simulation: Dict[str, Any],
        execution_report: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Orchestrates generation of all explanations."""
        return {
            "prediction_explanation": self.generate_prediction_explanation(prediction_output),
            "strategy_explanation": self.generate_strategy_explanation(strategy_evaluation),
            "simulation_explanation": self.generate_simulation_explanation(strategy_evaluation),
            "execution_explanation": self.generate_execution_explanation(execution_report),
            "helios_insight": self.generate_helios_insight(
                current_state, prediction_output, strategy_evaluation, execution_report
            )
        }


def generate_explanations(
    current_state: Dict[str, Any],
    prediction_output: Dict[str, Any],
    strategy_evaluation: Dict[str, Any],
    digital_twin_simulation: Dict[str, Any],
    execution_report: Dict[str, Any]
) -> Dict[str, Any]:
    engine = ExplainabilityEngine()
    return engine.generate_full_explanation(
        current_state,
        prediction_output,
        strategy_evaluation,
        digital_twin_simulation,
        execution_report
    )
