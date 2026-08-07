import os
import time
import logging
import json
import datetime
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

from evaluate import evaluate_classifier
from preprocessing import fit_scaler, transform_features, save_scaler

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DATA_PATH = "datasets/processed/processed_failures.csv"
MODEL_DIR = "ai_engine/models/"
REPORTS_DIR = "reports/"
MODEL_PATH = os.path.join(MODEL_DIR, "failure.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "failure_scaler.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "failure_metadata.json")

FEATURES = [
    'cpu_temperature_ratio',
    'power_temperature_ratio',
    'traffic_pressure',
    'weather_encoded',
    'failure_risk_score'
]
TARGET = 'failed'

def get_unique_filename(filepath: str) -> str:
    """Returns a versioned filename if the file already exists."""
    if not os.path.exists(filepath):
        return filepath
    
    base, ext = os.path.splitext(filepath)
    counter = 1
    new_filepath = f"{base}_v{counter}{ext}"
    while os.path.exists(new_filepath):
        counter += 1
        new_filepath = f"{base}_v{counter}{ext}"
    return new_filepath

def main():
    start_time = time.time()
    
    # 1. Load Dataset
    logging.info(f"Loading dataset from {DATA_PATH}...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        logging.error(f"Dataset not found at {DATA_PATH}. Please run feature_engineering.py first.")
        return
        
    logging.info(f"Dataset loaded successfully with {len(df)} rows.")
    
    # 2. Select features and target
    X = df[FEATURES]
    y = df[TARGET]
    
    # 3. Train Test Split
    logging.info("Splitting dataset into 80/20 train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # 4. Fit MinMaxScaler & Transform
    logging.info("Fitting scaler and transforming features...")
    scaler = fit_scaler(X_train, FEATURES)
    X_train_scaled = transform_features(X_train, scaler, FEATURES)
    X_test_scaled = transform_features(X_test, scaler, FEATURES)
    
    # 5. Initialize Model
    logging.info("Initializing RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        class_weight="balanced"
    )
    
    # 6. Train Model
    logging.info("Training started...")
    model.fit(X_train_scaled, y_train)
    logging.info("Training completed.")
    
    # 7. Evaluate Model
    metrics = evaluate_classifier(model, X_test_scaled, y_test, model_name="failure", reports_dir=REPORTS_DIR)
    
    # 8. Save Model and Scaler
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Save Model
    save_model_path = get_unique_filename(MODEL_PATH)
    joblib.dump(model, save_model_path)
    logging.info(f"Model saved successfully to {save_model_path}")
    
    # Save Scaler
    save_scaler_path = get_unique_filename(SCALER_PATH)
    save_scaler(scaler, save_scaler_path)
    logging.info(f"Scaler saved successfully to {save_scaler_path}")
    
    # 9. Save Metadata
    metadata = {
        "Model Name": "Failure Prediction Model",
        "Algorithm": "RandomForestClassifier",
        "Training Date": datetime.datetime.utcnow().isoformat() + "Z",
        "Feature List": FEATURES,
        "Scaler Used": "MinMaxScaler",
        "Accuracy": metrics.get("accuracy"),
        "Precision": metrics.get("precision"),
        "Recall": metrics.get("recall"),
        "F1": metrics.get("f1"),
        "ROC AUC": metrics.get("roc_auc"),
        "Version": "1.0",
        "Model Path": save_model_path,
        "Scaler Path": save_scaler_path
    }
    
    save_metadata_path = get_unique_filename(METADATA_PATH)
    with open(save_metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    logging.info(f"Metadata saved successfully to {save_metadata_path}")
    
    elapsed_time = time.time() - start_time
    logging.info(f"Execution time: {elapsed_time:.2f} seconds.")

if __name__ == "__main__":
    main()
