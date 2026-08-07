import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import Tower

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_towers():
    db: Session = SessionLocal()
    
    # We extract unique tower_ids from the three datasets
    files = [
        "processed_tower_utilization.csv",
        "processed_traffic.csv",
        "processed_failures.csv"
    ]
    
    unique_towers = set()
    
    for file in files:
        filepath = os.path.join(DATA_DIR, file)
        if os.path.exists(filepath):
            print(f"Reading {file}...")
            df = pd.read_csv(filepath, usecols=["tower_id"])
            unique_towers.update(df["tower_id"].unique())
        else:
            print(f"Warning: {filepath} not found.")

    print(f"Found {len(unique_towers)} unique towers. Inserting...")

    # Insert in batches
    batch_size = 500
    batch = []
    
    for i, tower_id in enumerate(unique_towers):
        # Check if already exists to avoid issues, though we can just ignore IntegrityError
        if not db.query(Tower).filter(Tower.tower_id == tower_id).first():
            batch.append(Tower(tower_id=tower_id))
        
        if len(batch) >= batch_size:
            db.add_all(batch)
            try:
                db.commit()
            except IntegrityError as e:
                db.rollback()
                print(f"Integrity error in batch: {e}")
            batch = []

    if batch:
        db.add_all(batch)
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            print(f"Integrity error in final batch: {e}")

    print("Finished importing towers.")
    db.close()

if __name__ == "__main__":
    import_towers()
