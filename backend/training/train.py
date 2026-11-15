import os
import sys
import json
import logging
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.database.connection import get_session, init_db
from app.models.model_version import ModelVersion

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

NUMERICAL_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_FEATURES = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
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
    "PaymentMethod"
]

def load_and_preprocess_data(dataset_path: str):
    logger.info(f"Loading dataset from: {dataset_path}")
    if not os.path.exists(dataset_path):
        # Check alternative locations
        fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Telco-Customer-Churn.csv"))
        if os.path.exists(fallback_path):
            dataset_path = fallback_path
        else:
            raise FileNotFoundError(f"Could not find dataset at {dataset_path} or {fallback_path}")

    df = pd.read_csv(dataset_path)
    logger.info(f"Loaded {len(df)} rows and {len(df.columns)} columns.")

    # Target variable cleaning: Churn Yes=1, No=0
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    # TotalCharges cleaning: replace spaces with NaN, convert to float, impute with tenure * MonthlyCharges
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].astype(str).str.strip(), errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["tenure"] * df["MonthlyCharges"]).fillna(0.0)

    # Convert SeniorCitizen to string category or int
    df["SeniorCitizen"] = df["SeniorCitizen"].astype(int)

    # Feature matrix X and target y
    feature_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    X = df[feature_cols].copy()
    y = df["Churn"].copy()

    return X, y

def train_model():
    os.makedirs(settings.ARTIFACT_DIR, exist_ok=True)
    dataset_path = settings.DATASET_PATH
    X, y = load_and_preprocess_data(dataset_path)

    logger.info("Splitting dataset into train (80%) and test (20%) stratified...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])

    logger.info("Training Random Forest model pipeline...")
    pipeline.fit(X_train, y_train)

    logger.info("Evaluating model performance on test set...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    logger.info(f"Test Accuracy: {acc:.4f}")
    logger.info(f"Test Precision: {prec:.4f}")
    logger.info(f"Test Recall: {rec:.4f}")
    logger.info(f"Test F1: {f1:.4f}")
    logger.info(f"Test ROC-AUC: {roc_auc:.4f}")
    logger.info(f"Confusion Matrix: {cm}")

    # Extract feature names & importances
    encoder = pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_feature_names = NUMERICAL_FEATURES + cat_feature_names
    rf_importances = pipeline.named_steps["classifier"].feature_importances_

    feature_importance_list = [
        {"feature": name, "importance": round(float(imp), 5)}
        for name, imp in sorted(zip(all_feature_names, rf_importances), key=lambda x: x[1], reverse=True)
    ]

    # Save model artifact
    artifact_path = os.path.join(settings.ARTIFACT_DIR, "model_v1.joblib")
    joblib.dump(pipeline, artifact_path)
    logger.info(f"Saved model artifact to: {artifact_path}")

    # Save metrics JSON
    metrics_path = os.path.join(settings.ARTIFACT_DIR, "metrics_v1.json")
    metrics_data = {
        "version": settings.MODEL_VERSION,
        "model_name": "Random Forest Classifier",
        "metrics": {
            "accuracy": acc,
            "precision_score": prec,
            "recall_score": rec,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "confusion_matrix": cm
        },
        "feature_importance": feature_importance_list[:20]  # Top 20 features
    }
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    logger.info(f"Saved metrics data to: {metrics_path}")

    # Record model in database
    try:
        init_db()
        db = get_session()
        # Deactivate previous versions
        db.query(ModelVersion).update({ModelVersion.is_active: False})
        
        # Check if version exists or add
        existing_version = db.query(ModelVersion).filter(ModelVersion.version == settings.MODEL_VERSION).first()
        if existing_version:
            existing_version.model_name = "Random Forest Classifier"
            existing_version.artifact_path = artifact_path
            existing_version.accuracy = acc
            existing_version.precision_score = prec
            existing_version.recall_score = rec
            existing_version.f1_score = f1
            existing_version.roc_auc = roc_auc
            existing_version.is_active = True
        else:
            new_version = ModelVersion(
                version=settings.MODEL_VERSION,
                model_name="Random Forest Classifier",
                artifact_path=artifact_path,
                accuracy=acc,
                precision_score=prec,
                recall_score=rec,
                f1_score=f1,
                roc_auc=roc_auc,
                is_active=True
            )
            db.add(new_version)
        db.commit()
        db.close()
        logger.info(f"Successfully recorded model version {settings.MODEL_VERSION} in database.")
    except Exception as e:
        logger.warning(f"Could not persist model version to DB: {e}")

    logger.info("Training pipeline completed successfully.")

if __name__ == "__main__":
    train_model()
