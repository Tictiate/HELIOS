import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import SessionLocal
from app.models.network import EdgeServer, EdgeTelemetry

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../datasets/processed'))

def import_edge_servers():
    db: Session = SessionLocal()
    
    filepath = os.path.join(DATA_DIR, "processed_edge_servers.csv")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return

    print("Reading processed_edge_servers.csv...")
    
    # 1. Insert Edge Servers (unique edge_ids)
    df = pd.read_csv(filepath, usecols=["edge_id"])
    unique_edges = df["edge_id"].unique()
    print(f"Found {len(unique_edges)} unique edge servers. Inserting...")

    for edge_id in unique_edges:
        if not db.query(EdgeServer).filter(EdgeServer.edge_id == edge_id).first():
            db.add(EdgeServer(edge_id=edge_id))
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        print(f"Integrity error inserting edge servers: {e}")

    # 2. Insert Edge Telemetry
    cols_to_keep = [
        "edge_id", "timestamp", "cpu_pct", "gpu_pct", 
        "memory_pct", "requests_per_min", "latency_ms", "edge_health"
    ]
    df = pd.read_csv(filepath, usecols=cols_to_keep)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    records = df.to_dict(orient='records')
    print(f"Found {len(records)} telemetry records. Inserting...")

    batch_size = 1000
    batch = []
    
    for i, row in enumerate(records):
        batch.append(EdgeTelemetry(**row))
        
        if len(batch) >= batch_size:
            db.add_all(batch)
            try:
                db.commit()
            except IntegrityError as e:
                db.rollback()
                print(f"Integrity error in batch: {e}")
            batch = []
            print(f"Inserted {i+1} telemetry records...")

    if batch:
        db.add_all(batch)
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            print(f"Integrity error in final batch: {e}")

    print("Finished importing edge servers and telemetry.")
    db.close()

if __name__ == "__main__":
    import_edge_servers()
