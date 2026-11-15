import os
import json
import logging
from typing import Dict, Any, Tuple, List, Optional
import pandas as pd
import numpy as np
import joblib
from app.core.config import settings

logger = logging.getLogger(__name__)

# Feature column definitions matching IBM Telco dataset
FEATURE_COLUMNS = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "tenure",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
    "MonthlyCharges",
    "TotalCharges"
]

class ChurnPredictor:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.feature_importances = []
        self.model_version = settings.MODEL_VERSION
        self.load_model()

    def get_artifact_path(self) -> str:
        return os.path.join(settings.ARTIFACT_DIR, "model_v1.joblib")

    def get_metrics_path(self) -> str:
        return os.path.join(settings.ARTIFACT_DIR, "metrics_v1.json")

    def load_model(self):
        model_path = self.get_artifact_path()
        metrics_path = self.get_metrics_path()
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info(f"Loaded trained ML model from {model_path}")
            except Exception as e:
                logger.error(f"Error loading model from {model_path}: {e}")
                self.model = None
        else:
            logger.warning(f"No model artifact found at {model_path}. Will need training.")

        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, "r") as f:
                    data = json.load(f)
                    self.metrics = data.get("metrics")
                    self.feature_importances = data.get("feature_importance", [])
                logger.info(f"Loaded model metrics from {metrics_path}")
            except Exception as e:
                logger.error(f"Error loading metrics from {metrics_path}: {e}")

    def determine_risk_level(self, probability: float) -> str:
        """
        Risk level thresholds specified:
        Below 40%: LOW
        40% - 69.99%: MEDIUM
        70% or above: HIGH
        """
        if probability < 0.40:
            return "LOW"
        elif probability < 0.70:
            return "MEDIUM"
        else:
            return "HIGH"

    def predict(self, input_dict: Dict[str, Any]) -> Tuple[bool, float, str, List[Dict[str, Any]]]:
        """
        Takes raw dictionary of 19 features, preprocesses, predicts probability and risk level.
        Returns: (predicted_churn, churn_probability, risk_level, top_risk_factors)
        """
        # Ensure model is loaded
        if self.model is None:
            self.load_model()
            if self.model is None:
                raise RuntimeError("ML model is not loaded or trained yet.")

        # Normalize keys: accept either PascalCase or snake_case
        feature_mapping = {
            "gender": input_dict.get("gender", "Male"),
            "SeniorCitizen": int(input_dict.get("SeniorCitizen", input_dict.get("senior_citizen", 0))),
            "Partner": input_dict.get("Partner", input_dict.get("partner", "No")),
            "Dependents": input_dict.get("Dependents", input_dict.get("dependents", "No")),
            "tenure": int(input_dict.get("tenure", 1)),
            "PhoneService": input_dict.get("PhoneService", input_dict.get("phone_service", "Yes")),
            "MultipleLines": input_dict.get("MultipleLines", input_dict.get("multiple_lines", "No")),
            "InternetService": input_dict.get("InternetService", input_dict.get("internet_service", "DSL")),
            "OnlineSecurity": input_dict.get("OnlineSecurity", input_dict.get("online_security", "No")),
            "OnlineBackup": input_dict.get("OnlineBackup", input_dict.get("online_backup", "No")),
            "DeviceProtection": input_dict.get("DeviceProtection", input_dict.get("device_protection", "No")),
            "TechSupport": input_dict.get("TechSupport", input_dict.get("tech_support", "No")),
            "StreamingTV": input_dict.get("StreamingTV", input_dict.get("streaming_tv", "No")),
            "StreamingMovies": input_dict.get("StreamingMovies", input_dict.get("streaming_movies", "No")),
            "Contract": input_dict.get("Contract", input_dict.get("contract", "Month-to-month")),
            "PaperlessBilling": input_dict.get("PaperlessBilling", input_dict.get("paperless_billing", "Yes")),
            "PaymentMethod": input_dict.get("PaymentMethod", input_dict.get("payment_method", "Electronic check")),
            "MonthlyCharges": float(input_dict.get("MonthlyCharges", input_dict.get("monthly_charges", 29.85))),
            "TotalCharges": float(input_dict.get("TotalCharges", input_dict.get("total_charges", 29.85)))
        }

        # Convert to single-row DataFrame with exact columns
        df = pd.DataFrame([feature_mapping], columns=FEATURE_COLUMNS)

        # Get probability
        probas = self.model.predict_proba(df)[0]
        # probas: [P(Churn=0), P(Churn=1)]
        churn_prob = float(probas[1])
        predicted_churn = bool(churn_prob >= 0.50)
        risk_level = self.determine_risk_level(churn_prob)

        # Identify key risk factors based on customer characteristics
        risk_factors = []
        if feature_mapping["Contract"] == "Month-to-month":
            risk_factors.append({"factor": "Month-to-month Contract", "impact": "High risk contributor"})
        if feature_mapping["tenure"] <= 6:
            risk_factors.append({"factor": "Short Tenure (≤ 6 months)", "impact": "High early attrition rate"})
        if feature_mapping["PaymentMethod"] == "Electronic check":
            risk_factors.append({"factor": "Electronic Check Payment", "impact": "Associated with higher churn rate"})
        if feature_mapping["TechSupport"] == "No":
            risk_factors.append({"factor": "No Tech Support", "impact": "Increases frustration risk"})
        if feature_mapping["OnlineSecurity"] == "No":
            risk_factors.append({"factor": "No Online Security", "impact": "Lacks value-add retention lock-in"})
        if feature_mapping["MonthlyCharges"] > 75.0:
            risk_factors.append({"factor": "High Monthly Charges (> $75)", "impact": "Cost sensitivity risk"})

        return predicted_churn, round(churn_prob, 5), risk_level, risk_factors

predictor = ChurnPredictor()
