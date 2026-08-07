import os
import time
import logging
from typing import Dict, Any, Tuple
import datetime
import pandas as pd
import joblib
import json

from ai_engine.prediction.preprocessing import load_scaler, transform_features

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants for file paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Cache models
_cache: Dict[str, Any] = {
    'models': {},
    'scalers': {},
    'metadata': {}
}

def _get_latest_metadata(model_prefix: str) -> str:
    """Finds the most recent metadata file."""
    return os.path.join(MODELS_DIR, f"{model_prefix}_metadata.json")

def load_models() -> None:
    """Loads and caches models, scalers, and metadata into memory."""
    if 'congestion' not in _cache['models']:
        meta_path = _get_latest_metadata('congestion')
        with open(meta_path, 'r') as f:
            meta = json.load(f)
        
        workspace_root = os.path.dirname(BASE_DIR)
        model_path = os.path.join(workspace_root, meta['Model Path'])
        scaler_path = os.path.join(workspace_root, meta['Scaler Path'])
        
        _cache['metadata']['congestion'] = meta
        _cache['models']['congestion'] = joblib.load(model_path)
        _cache['scalers']['congestion'] = load_scaler(scaler_path)
            
    if 'failure' not in _cache['models']:
        meta_path = _get_latest_metadata('failure')
        with open(meta_path, 'r') as f:
            meta = json.load(f)
            
        workspace_root = os.path.dirname(BASE_DIR)
        model_path = os.path.join(workspace_root, meta['Model Path'])
        scaler_path = os.path.join(workspace_root, meta['Scaler Path'])
        
        _cache['metadata']['failure'] = meta
        _cache['models']['failure'] = joblib.load(model_path)
        _cache['scalers']['failure'] = load_scaler(scaler_path)

def _safe_divide(a: float, b: float) -> float:
    """Safely divide two numbers, returning 0 if division by zero."""
    return 0.0 if b == 0 else a / b

def engineer_features(network_state: Dict[str, Any]) -> pd.DataFrame:
    """Generates features from raw network state using the formulas from feature_engineering.py."""
    
    # 1. Extract and validate required raw fields
    required_fields = [
        'users', 'available_bandwidth_mbps', 'latency_ms', 'packet_loss_pct',
        'power_usage_pct', 'temperature_c', 'cpu_usage_pct', 'traffic_load', 'weather'
    ]
    for field in required_fields:
        if field not in network_state:
            raise ValueError(f"Missing required field in network_state: {field}")
        if network_state[field] is None:
            raise ValueError(f"Field {field} cannot be null.")
            
        # Check negative for numerics
        if isinstance(network_state[field], (int, float)) and network_state[field] < 0:
            if field != 'temperature_c': # temperature can theoretically be negative
                raise ValueError(f"Field {field} cannot be negative.")

    users = float(network_state['users'])
    avail_bw = float(network_state['available_bandwidth_mbps'])
    latency = float(network_state['latency_ms'])
    packet_loss = float(network_state['packet_loss_pct'])
    power_usage = float(network_state['power_usage_pct'])
    temp_c = float(network_state['temperature_c'])
    cpu_usage = float(network_state['cpu_usage_pct'])
    traffic_load = float(network_state['traffic_load'])
    weather = str(network_state['weather']).lower()
    
    weather_map = {'clear': 0, 'fog': 1, 'rain': 2, 'storm': 3}
    if weather not in weather_map:
        raise ValueError(f"Invalid weather value: {weather}. Allowed values: {list(weather_map.keys())}")
        
    # Generate features
    tower_load = users
    bandwidth_usage = 100.0 - avail_bw
    traffic_density = _safe_divide(users, avail_bw)
    latency_ratio = latency
    packet_loss_ratio = packet_loss
    power_efficiency = _safe_divide(avail_bw, power_usage)
    thermal_stress = temp_c
    
    score_util = (users * 0.4) + (latency * 0.2) + (packet_loss * 0.2) + (temp_c * 0.2)
    utilization_score = score_util
    
    cpu_temperature_ratio = _safe_divide(cpu_usage, temp_c)
    power_temperature_ratio = _safe_divide(power_usage, temp_c)
    traffic_pressure = traffic_load
    weather_encoded = weather_map[weather]
    
    score_fail = (temp_c * 0.25) + (power_usage * 0.2) + (traffic_load * 0.2) + (cpu_usage * 0.2) + (weather_encoded * 0.15)
    failure_risk_score = score_fail
    
    # We map these directly to the names the model expects
    features_dict = {
        'tower_load': [tower_load],
        'bandwidth_usage': [bandwidth_usage],
        'traffic_density': [traffic_density],
        'latency_ratio': [latency_ratio],
        'packet_loss_ratio': [packet_loss_ratio],
        'power_efficiency': [power_efficiency],
        'thermal_stress': [thermal_stress],
        'utilization_score': [utilization_score],
        'cpu_temperature_ratio': [cpu_temperature_ratio],
        'power_temperature_ratio': [power_temperature_ratio],
        'traffic_pressure': [traffic_pressure],
        'weather_encoded': [weather_encoded],
        'failure_risk_score': [failure_risk_score]
    }
    
    return pd.DataFrame(features_dict)

def validate_features(df: pd.DataFrame, expected_features: list) -> pd.DataFrame:
    """Validates that all expected features are present and reorders them."""
    missing = set(expected_features) - set(df.columns)
    if missing:
        raise ValueError(f"Missing expected features for prediction: {missing}")
    return df[expected_features]

def predict_congestion(features_df: pd.DataFrame) -> Tuple[float, str, float]:
    """Runs the congestion prediction model."""
    meta = _cache['metadata']['congestion']
    expected_cols = meta['Feature List']
    
    X = validate_features(features_df, expected_cols)
    X_scaled = transform_features(X, _cache['scalers']['congestion'], expected_cols)
    
    model = _cache['models']['congestion']
    proba = model.predict_proba(X_scaled)[0] # Returns [prob_0, prob_1]
    
    prob_congested = float(proba[1]) * 100.0
    prediction = "Congested" if prob_congested >= 50.0 else "Healthy"
    confidence = float(max(proba)) * 100.0
    
    return prob_congested, prediction, confidence

def predict_failure(features_df: pd.DataFrame) -> Tuple[float, str, float]:
    """Runs the failure prediction model."""
    meta = _cache['metadata']['failure']
    expected_cols = meta['Feature List']
    
    X = validate_features(features_df, expected_cols)
    X_scaled = transform_features(X, _cache['scalers']['failure'], expected_cols)
    
    model = _cache['models']['failure']
    proba = model.predict_proba(X_scaled)[0] # Returns [prob_0, prob_1]
    
    prob_failed = float(proba[1]) * 100.0
    prediction = "Failure Risk" if prob_failed >= 50.0 else "Healthy"
    confidence = float(max(proba)) * 100.0
    
    return prob_failed, prediction, confidence

def calculate_network_health(
    latency: float, 
    packet_loss: float, 
    power_usage: float, 
    congestion_prob: float, 
    failure_prob: float
) -> Tuple[int, str]:
    """Calculates an overall network health score (0-100) and status."""
    
    # Lower is better for all these metrics
    lat_n = max(0, 1.0 - (latency / 100.0))
    pl_n = max(0, 1.0 - (packet_loss / 100.0))
    pow_n = max(0, 1.0 - (power_usage / 100.0))
    cong_n = max(0, 1.0 - (congestion_prob / 100.0))
    fail_n = max(0, 1.0 - (failure_prob / 100.0))
    
    # Weighted average
    score = (lat_n * 0.15) + (pl_n * 0.25) + (pow_n * 0.1) + (cong_n * 0.2) + (fail_n * 0.3)
    health_score = int(score * 100)
    
    # Bound score
    health_score = max(0, min(100, health_score))
    
    if health_score >= 90:
        status = "Excellent"
    elif health_score >= 75:
        status = "Good"
    elif health_score >= 50:
        status = "Warning"
    else:
        status = "Critical"
        
    return health_score, status

def calculate_overall_confidence(conf1: float, conf2: float) -> float:
    """Averages model confidences."""
    return round((conf1 + conf2) / 2.0, 1)

class HELIOSAI:
    """Main AI Engine brain class."""
    
    def __init__(self):
        load_models()
        
    def predict(self, network_state: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the entire prediction pipeline for a given network state."""
        logger.info("Prediction Started")
        start_time = time.time()
        
        # 1. Feature Engineering
        features_df = engineer_features(network_state)
        
        # 2. Predict Congestion
        cong_prob, cong_pred, cong_conf = predict_congestion(features_df)
        
        # 3. Predict Failure
        fail_prob, fail_pred, fail_conf = predict_failure(features_df)
        
        # 4. Compute Health
        health_score, health_status = calculate_network_health(
            latency=float(network_state['latency_ms']),
            packet_loss=float(network_state['packet_loss_pct']),
            power_usage=float(network_state['power_usage_pct']),
            congestion_prob=cong_prob,
            failure_prob=fail_prob
        )
        
        # 5. Compute Overall Confidence
        overall_conf = calculate_overall_confidence(cong_conf, fail_conf)
        
        # Track timing
        execution_time = time.time() - start_time
        
        # Result dictionary
        result = {
            "tower_id": network_state.get('tower_id', 'Unknown'),
            "prediction": {
                "congestion": {
                    "probability": round(cong_prob, 1),
                    "prediction": cong_pred,
                    "confidence": round(cong_conf, 1)
                },
                "failure": {
                    "probability": round(fail_prob, 1),
                    "prediction": fail_pred,
                    "confidence": round(fail_conf, 1)
                }
            },
            "network_health": health_score,
            "health_status": health_status,
            "overall_confidence": overall_conf,
            "prediction_window": "Next 5 Minutes",
            "next_step": "Strategy Planner",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "execution_time_ms": round(execution_time * 1000, 2)
        }
        
        logger.info(f"Prediction Finished in {execution_time:.4f}s. Confidence: {overall_conf}%")
        return result

# Expose a public function as requested
def helios_predict(network_state: Dict[str, Any]) -> Dict[str, Any]:
    """Public wrapper to instantiate brain and predict."""
    brain = HELIOSAI()
    return brain.predict(network_state)
