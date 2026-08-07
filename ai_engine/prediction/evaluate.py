import logging
import os
from typing import Tuple, Dict, Any
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def print_metrics(y_true, y_pred, y_prob=None) -> Dict[str, float]:
    """Calculates and logs classification metrics."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    metrics = {
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1
    }
    
    logging.info(f"Accuracy:  {acc:.4f}")
    logging.info(f"Precision: {prec:.4f}")
    logging.info(f"Recall:    {rec:.4f}")
    logging.info(f"F1 Score:  {f1:.4f}")
    
    if y_prob is not None:
        try:
            auc = roc_auc_score(y_true, y_prob)
            metrics['roc_auc'] = auc
            logging.info(f"ROC AUC:   {auc:.4f}")
        except ValueError:
            logging.warning("ROC AUC cannot be calculated (e.g., only one class in y_true).")
            
    logging.info("\nClassification Report:\n" + classification_report(y_true, y_pred, zero_division=0))
    return metrics

def plot_confusion_matrix(y_true, y_pred, save_path: str, title: str = "Confusion Matrix"):
    """Generates and saves a confusion matrix plot."""
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    disp.plot(cmap='Blues', ax=ax, values_format='d')
    ax.set_title(title)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close()
    logging.info(f"Saved confusion matrix plot to {save_path}")

def plot_feature_importance(model, feature_names: list, save_path: str, title: str = "Feature Importance"):
    """Generates and saves a feature importance plot."""
    if not hasattr(model, 'feature_importances_'):
        logging.warning("Model does not have feature_importances_ attribute. Skipping plot.")
        return
        
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    sorted_importances = importances[indices]
    sorted_features = [feature_names[i] for i in indices]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(range(len(importances)), sorted_importances, align='center', color='skyblue')
    ax.set_xticks(range(len(importances)))
    ax.set_xticklabels(sorted_features, rotation=45, ha='right')
    ax.set_title(title)
    ax.set_ylabel('Importance')
    ax.set_xlabel('Feature')
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close()
    logging.info(f"Saved feature importance plot to {save_path}")

def evaluate_classifier(model, X_test, y_test, model_name: str, reports_dir: str) -> Dict[str, float]:
    """
    Evaluates a trained classifier, prints metrics, and generates plots.
    Returns the dictionary of computed metrics.
    """
    logging.info(f"Evaluating {model_name} model...")
    y_pred = model.predict(X_test)
    y_prob = None
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
        
    metrics = print_metrics(y_test, y_pred, y_prob)
    
    # Generate plots
    cm_path = os.path.join(reports_dir, f"{model_name}_confusion_matrix.png")
    plot_confusion_matrix(y_test, y_pred, save_path=cm_path, title=f"{model_name.capitalize()} Confusion Matrix")
    
    fi_path = os.path.join(reports_dir, f"{model_name}_feature_importance.png")
    feature_names = list(X_test.columns)
    plot_feature_importance(model, feature_names, save_path=fi_path, title=f"{model_name.capitalize()} Feature Importance")
    
    return metrics
