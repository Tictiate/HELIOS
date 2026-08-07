import os
import logging
import pandas as pd
import numpy as np
from data_loader import load_all_datasets

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

OUTPUT_DIR = "datasets/processed/"

def safe_divide(a, b):
    """Safely divide two pandas Series, replacing division by zero or inf with 0."""
    result = a / b
    return result.replace([np.inf, -np.inf], 0).fillna(0)

def engineer_tower_utilization(df: pd.DataFrame) -> pd.DataFrame:
    """Generates features for Tower Utilization dataset."""
    logging.info("Engineering features for Tower Utilization...")
    
    # 1. tower_load (Raw feature)
    df['tower_load'] = df['users']
    
    # 2. bandwidth_usage
    df['bandwidth_usage'] = 100 - df['available_bandwidth_mbps']
    
    # 3. traffic_density
    df['traffic_density'] = safe_divide(df['users'], df['available_bandwidth_mbps'])
    
    # 4. latency_ratio (Raw feature without normalization)
    df['latency_ratio'] = df['latency_ms']
    
    # 5. packet_loss_ratio (Raw feature without normalization)
    df['packet_loss_ratio'] = df['packet_loss_pct']
    
    # 6. power_efficiency
    df['power_efficiency'] = safe_divide(df['available_bandwidth_mbps'], df['power_usage_pct'])
    
    # 7. thermal_stress (Raw feature without normalization)
    df['thermal_stress'] = df['temperature_c']
    
    # 8. utilization_score (Raw feature based on raw inputs)
    users_raw = df['users']
    latency_raw = df['latency_ms']
    pl_raw = df['packet_loss_pct']
    temp_raw = df['temperature_c']
    
    score = (users_raw * 0.4) + (latency_raw * 0.2) + (pl_raw * 0.2) + (temp_raw * 0.2)
    df['utilization_score'] = score
    
    # 9. Target Label: congested
    condition = (df['users'] > 900) & ((df['latency_ms'] > 25) | (df['packet_loss_pct'] > 2))
    df['congested'] = condition.astype(int)
    
    logging.info(f"Tower Utilization: {len(df)} rows, {len(df.columns)} features.")
    return df

def engineer_tower_failures(df: pd.DataFrame) -> pd.DataFrame:
    """Generates features for Tower Failures dataset."""
    logging.info("Engineering features for Tower Failures...")
    
    # 1. cpu_temperature_ratio
    df['cpu_temperature_ratio'] = safe_divide(df['cpu_usage_pct'], df['temperature_c'])
    
    # 2. power_temperature_ratio
    df['power_temperature_ratio'] = safe_divide(df['power_usage_pct'], df['temperature_c'])
    
    # 3. traffic_pressure
    df['traffic_pressure'] = df['traffic_load']
    
    # 4. weather_encoded
    weather_map = {'clear': 0, 'fog': 1, 'rain': 2, 'storm': 3}
    df['weather_encoded'] = df['weather'].map(weather_map).fillna(0)
    
    # 5. failure_risk_score
    temp_raw = df['temperature_c']
    pow_raw = df['power_usage_pct']
    traf_raw = df['traffic_load']
    cpu_raw = df['cpu_usage_pct']
    weath_raw = df['weather_encoded']
    
    score = (temp_raw * 0.25) + (pow_raw * 0.2) + (traf_raw * 0.2) + (cpu_raw * 0.2) + (weath_raw * 0.15)
    df['failure_risk_score'] = score
    
    logging.info(f"Tower Failures: {len(df)} rows, {len(df.columns)} features.")
    return df

def engineer_traffic_profile(df: pd.DataFrame) -> pd.DataFrame:
    """Generates features for Traffic Profile dataset."""
    logging.info("Engineering features for Traffic Profile...")
    
    # Extract time features
    df['hour'] = df['timestamp'].dt.hour
    df['minute'] = df['timestamp'].dt.minute
    df['day'] = df['timestamp'].dt.day
    df['weekday'] = df['timestamp'].dt.weekday
    df['is_weekend'] = df['weekday'].apply(lambda x: 1 if x >= 5 else 0)
    
    # 1. total_users
    df['total_users'] = df['video_users'] + df['voice_users'] + df['gaming_users'] + df['emergency_users']
    
    # Replace 0 with 1 to avoid division by zero
    total_safe = df['total_users'].replace(0, 1)
    
    # 2. high_priority_ratio
    df['high_priority_ratio'] = df['emergency_users'] / total_safe
    
    # 3. iot_ratio
    df['iot_ratio'] = df['iot_devices'] / total_safe
    
    # 4. consumer_ratio
    df['consumer_ratio'] = (df['video_users'] + df['gaming_users']) / total_safe
    
    logging.info(f"Traffic Profile: {len(df)} rows, {len(df.columns)} features.")
    return df

def engineer_edge_servers(df: pd.DataFrame) -> pd.DataFrame:
    """Generates features for Edge Servers dataset."""
    logging.info("Engineering features for Edge Servers...")
    
    # 1. resource_utilization
    df['resource_utilization'] = (df['cpu_pct'] + df['gpu_pct'] + df['memory_pct']) / 3.0
    
    # 2. processing_efficiency
    df['processing_efficiency'] = safe_divide(df['requests_per_min'], df['cpu_pct'])
    
    # 3. latency_efficiency
    df['latency_efficiency'] = safe_divide(df['requests_per_min'], df['latency_ms'])
    
    # 4. edge_health (Raw inputs)
    cpu_raw = df['cpu_pct']
    gpu_raw = df['gpu_pct']
    mem_raw = df['memory_pct']
    lat_raw = df['latency_ms']
    
    health_score = (cpu_raw * 0.3) + (gpu_raw * 0.2) + (mem_raw * 0.3) + (lat_raw * 0.2)
    df['edge_health'] = health_score
    
    logging.info(f"Edge Servers: {len(df)} rows, {len(df.columns)} features.")
    return df

def engineer_network_health(df: pd.DataFrame) -> pd.DataFrame:
    """Generates features for Network Health dataset."""
    logging.info("Engineering features for Network Health...")
    
    lat_raw = df['latency_ms']
    pl_raw = df['packet_loss_pct']
    avail_raw = df['availability_pct']
    energy_raw = df['energy_usage_pct']
    util_raw = df['resource_utilization_pct']
    
    # 1. overall_health_index (Raw score without arbitrary 0-100 normalization)
    score = (lat_raw * 0.2) + (pl_raw * 0.3) + (avail_raw * 0.3) + (energy_raw * 0.1) + (util_raw * 0.1)
    df['overall_health_index'] = score
    
    # 2. health_category (we will keep original categorical bounds assuming the dataset is well behaved)
    def categorize_health(val):
        # We might need to adjust this depending on the raw scale. Since we are removing manual scaling,
        # let's just use quantiles or keep it as is if it's just for reporting.
        if val >= 90: return 'Excellent'
        if val >= 70: return 'Good'
        if val >= 40: return 'Warning'
        return 'Critical'
        
    df['health_category'] = df['overall_health_index'].apply(categorize_health)
    
    logging.info(f"Network Health: {len(df)} rows, {len(df.columns)} features.")
    return df

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Load data
    datasets = load_all_datasets()
    
    # Engineer features
    proc_tower_util = engineer_tower_utilization(datasets['tower_utilization'])
    proc_failures = engineer_tower_failures(datasets['tower_failures'])
    proc_traffic = engineer_traffic_profile(datasets['traffic_profile'])
    proc_edge = engineer_edge_servers(datasets['edge_servers'])
    proc_net_health = engineer_network_health(datasets['network_health'])
    
    # Save processed datasets
    paths = {
        'processed_tower_utilization.csv': proc_tower_util,
        'processed_failures.csv': proc_failures,
        'processed_traffic.csv': proc_traffic,
        'processed_edge_servers.csv': proc_edge,
        'processed_network_health.csv': proc_net_health
    }
    
    for filename, df in paths.items():
        out_path = os.path.join(OUTPUT_DIR, filename)
        df.to_csv(out_path, index=False)
        logging.info(f"Saved {filename} to {out_path}")
        
    logging.info("Feature engineering pipeline completed successfully.")

if __name__ == "__main__":
    main()
