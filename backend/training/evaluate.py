import os
import sys
import logging
import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import settings
from training.train import load_and_preprocess_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def evaluate_model():
    model_path = os.path.join(settings.ARTIFACT_DIR, "model_v1.joblib")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}. Run train.py first.")
        return

    logger.info(f"Loading trained pipeline from {model_path}...")
    pipeline = joblib.load(model_path)

    X, y = load_and_preprocess_data(settings.DATASET_PATH)
    logger.info("Running evaluation predictions across dataset...")
    y_pred = pipeline.predict(X)
    y_proba = pipeline.predict_proba(X)[:, 1]

    print("\n" + "=" * 50)
    print("      CUSTOMER CHURN MODEL EVALUATION REPORT")
    print("=" * 50)
    print(classification_report(y, y_pred, target_names=["Retained (0)", "Churned (1)"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y, y_pred))
    print(f"\nROC-AUC Score: {roc_auc_score(y, y_proba):.4f}")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    evaluate_model()
