import os
import joblib
import pandas as pd
from typing import List
from sklearn.preprocessing import MinMaxScaler

def fit_scaler(df: pd.DataFrame, features: List[str]) -> MinMaxScaler:
    """Fits a MinMaxScaler on the specified features of the DataFrame."""
    scaler = MinMaxScaler()
    scaler.fit(df[features])
    return scaler

def save_scaler(scaler: MinMaxScaler, filepath: str) -> None:
    """Saves a fitted scaler to the given filepath."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(scaler, filepath)

def load_scaler(filepath: str) -> MinMaxScaler:
    """Loads a fitted scaler from the given filepath."""
    return joblib.load(filepath)

def transform_features(df: pd.DataFrame, scaler: MinMaxScaler, features: List[str]) -> pd.DataFrame:
    """
    Transforms the specified features using the provided scaler.
    Returns a new DataFrame with the scaled values in the specified columns.
    """
    scaled_values = scaler.transform(df[features])
    scaled_df = pd.DataFrame(scaled_values, columns=features, index=df.index)
    
    # Create a copy to not modify original
    out_df = df.copy()
    for col in features:
        out_df[col] = scaled_df[col]
        
    return out_df
