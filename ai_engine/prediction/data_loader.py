import pandas as pd
import logging
from typing import Tuple, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DATASETS_DIR = "datasets/synthetic/"

def _load_and_clean(filepath: str, required_columns: list, timestamp_col: str = None) -> pd.DataFrame:
    """Helper function to load a CSV, validate, clean, and return a DataFrame."""
    try:
        df = pd.read_csv(filepath)
    except FileNotFoundError:
        logging.error(f"File not found: {filepath}")
        raise

    # Validate columns
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in {filepath}: {missing_cols}")

    # Handle missing values by dropping them for ML safety (could alternatively impute)
    initial_len = len(df)
    df = df.dropna(subset=required_columns)
    if len(df) < initial_len:
        logging.info(f"Dropped {initial_len - len(df)} rows with missing values in {filepath}")

    # Remove duplicates
    initial_len = len(df)
    df = df.drop_duplicates()
    if len(df) < initial_len:
        logging.info(f"Dropped {initial_len - len(df)} duplicate rows in {filepath}")

    # Convert timestamps
    if timestamp_col and timestamp_col in df.columns:
        df[timestamp_col] = pd.to_datetime(df[timestamp_col])

    logging.info(f"Successfully loaded {filepath} with {len(df)} rows.")
    return df

def load_tower_utilization() -> pd.DataFrame:
    """Loads and cleans the tower utilization dataset."""
    cols = ['timestamp', 'tower_id', 'users', 'available_bandwidth_mbps', 
            'latency_ms', 'packet_loss_pct', 'power_usage_pct', 'temperature_c']
    return _load_and_clean(DATASETS_DIR + "tower_utilization.csv", cols, "timestamp")

def load_tower_failures() -> pd.DataFrame:
    """Loads and cleans the tower failures dataset."""
    cols = ['tower_id', 'temperature_c', 'power_usage_pct', 'traffic_load', 
            'weather', 'cpu_usage_pct', 'failed']
    return _load_and_clean(DATASETS_DIR + "tower_failures.csv", cols)

def load_traffic_profile() -> pd.DataFrame:
    """Loads and cleans the traffic profile dataset."""
    cols = ['timestamp', 'tower_id', 'video_users', 'voice_users', 
            'iot_devices', 'gaming_users', 'emergency_users']
    return _load_and_clean(DATASETS_DIR + "traffic_profile.csv", cols, "timestamp")

def load_edge_servers() -> pd.DataFrame:
    """Loads and cleans the edge servers dataset."""
    cols = ['timestamp', 'edge_id', 'cpu_pct', 'gpu_pct', 'memory_pct', 
            'requests_per_min', 'latency_ms']
    return _load_and_clean(DATASETS_DIR + "edge_servers.csv", cols, "timestamp")

def load_network_health() -> pd.DataFrame:
    """Loads and cleans the network health dataset."""
    cols = ['latency_ms', 'packet_loss_pct', 'availability_pct', 
            'energy_usage_pct', 'resource_utilization_pct', 'network_health_score']
    # network_health.csv does not have a timestamp column
    return _load_and_clean(DATASETS_DIR + "network_health.csv", cols)

def load_network_nodes() -> pd.DataFrame:
    """Loads and cleans the network nodes dataset."""
    cols = ['node_id', 'node_type']
    return _load_and_clean(DATASETS_DIR + "network_nodes.csv", cols)

def load_all_datasets() -> Dict[str, pd.DataFrame]:
    """Loads all datasets and returns them in a dictionary."""
    logging.info("Starting to load all datasets...")
    return {
        "tower_utilization": load_tower_utilization(),
        "tower_failures": load_tower_failures(),
        "traffic_profile": load_traffic_profile(),
        "edge_servers": load_edge_servers(),
        "network_health": load_network_health(),
        "network_nodes": load_network_nodes()
    }
