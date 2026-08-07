import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import NetworkHealth

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_network_health():
    db: Session = SessionLocal()
    
    filepath = os.path.join(DATA_DIR, "processed_network_health.csv")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return

    print("Reading processed_network_health.csv...")
    cols_to_keep = [
        "latency_ms", "packet_loss_pct", "availability_pct", 
        "energy_usage_pct", "resource_utilization_pct", 
        "overall_health_index", "health_category"
    ]
    # Check if timestamp exists in the file, include if it does
    df_preview = pd.read_csv(filepath, nrows=0)
    if "timestamp" in df_preview.columns:
        cols_to_keep.append("timestamp")
        
    df = pd.read_csv(filepath, usecols=cols_to_keep)
    
    if "timestamp" in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    else:
        df['timestamp'] = None
    
    records = df.to_dict(orient='records')
    print(f"Found {len(records)} records. Inserting...")

    batch_size = 1000
    batch = []
    
    for i, row in enumerate(records):
        batch.append(NetworkHealth(**row))
        
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

    print("Finished importing network health.")
    db.close()

if __name__ == "__main__":
    import_network_health()
