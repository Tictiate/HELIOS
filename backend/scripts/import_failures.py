import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import Failure

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_failures():
    db: Session = SessionLocal()
    
    filepath = os.path.join(DATA_DIR, "processed_failures.csv")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return

    print("Reading processed_failures.csv...")
    cols_to_keep = [
        "tower_id", "temperature_c", "power_usage_pct", 
        "traffic_load", "weather", "cpu_usage_pct", "failed"
    ]
    df = pd.read_csv(filepath, usecols=cols_to_keep)
    
    records = df.to_dict(orient='records')
    print(f"Found {len(records)} records. Inserting...")

    batch_size = 1000
    batch = []
    
    for i, row in enumerate(records):
        batch.append(Failure(**row))
        
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

    print("Finished importing failures.")
    db.close()

if __name__ == "__main__":
    import_failures()
