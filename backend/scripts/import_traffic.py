import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import Traffic

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_traffic():
    db: Session = SessionLocal()
    
    filepath = os.path.join(DATA_DIR, "processed_traffic.csv")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return

    print("Reading processed_traffic.csv...")
    cols_to_keep = [
        "tower_id", "timestamp", "video_users", "voice_users", 
        "iot_devices", "gaming_users", "emergency_users", "total_users"
    ]
    df = pd.read_csv(filepath, usecols=cols_to_keep)
    
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    records = df.to_dict(orient='records')
    print(f"Found {len(records)} records. Inserting...")

    batch_size = 1000
    batch = []
    
    for i, row in enumerate(records):
        batch.append(Traffic(**row))
        
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

    print("Finished importing traffic.")
    db.close()

if __name__ == "__main__":
    import_traffic()
