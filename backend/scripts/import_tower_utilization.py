import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import TowerUtilization

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_tower_utilization():
    db: Session = SessionLocal()
    
    filepath = os.path.join(DATA_DIR, "processed_tower_utilization.csv")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return

    print("Reading processed_tower_utilization.csv...")
    # Keep only the columns that map to our DB schema
    cols_to_keep = [
        "tower_id", "timestamp", "users", "available_bandwidth_mbps",
        "latency_ms", "packet_loss_pct", "power_usage_pct", "temperature_c",
        "utilization_score", "congested"
    ]
    df = pd.read_csv(filepath, usecols=cols_to_keep)
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Replace NaN with appropriate defaults or None if needed, here we'll assume the dataset is clean based on prompt
    records = df.to_dict(orient='records')
    print(f"Found {len(records)} records. Inserting...")

    batch_size = 1000
    batch = []
    
    for i, row in enumerate(records):
        batch.append(TowerUtilization(**row))
        
        if len(batch) >= batch_size:
            db.add_all(batch)
            try:
                db.commit()
            except IntegrityError as e:
                db.rollback()
                print(f"Integrity error in batch: {e}")
            batch = []
            print(f"Inserted {i+1} records...")

    if batch:
        db.add_all(batch)
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            print(f"Integrity error in final batch: {e}")

    print("Finished importing tower utilization.")
    db.close()

if __name__ == "__main__":
    import_tower_utilization()
