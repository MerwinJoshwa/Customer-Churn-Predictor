import os
import sys
import logging
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.database.connection import get_session, init_db
from app.models.customer import Customer
from app.models.user import User
from app.models.model_version import ModelVersion
from app.models.prediction import Prediction
from app.ml.predictor import predictor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def import_telco_data(limit: int = None):
    init_db()
    db = get_session()

    existing_count = db.query(Customer).count()
    if existing_count > 0:
        logger.info(f"Database already contains {existing_count} customers. Skipping import.")
        db.close()
        return

    csv_path = settings.DATASET_PATH
    if not os.path.exists(csv_path):
        fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Telco-Customer-Churn.csv"))
        if os.path.exists(fallback_path):
            csv_path = fallback_path
        else:
            logger.error(f"Cannot find dataset at {csv_path}")
            db.close()
            return

    logger.info(f"Reading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    if limit:
        df = df.head(limit)

    logger.info(f"Preparing {len(df)} customer records for database insertion...")
    customers_to_insert = []
    for _, row in df.iterrows():
        # Handle TotalCharges clean
        raw_total = str(row.get("TotalCharges", "0")).strip()
        try:
            total_charges = float(raw_total) if raw_total else (float(row["tenure"]) * float(row["MonthlyCharges"]))
        except ValueError:
            total_charges = float(row["tenure"]) * float(row["MonthlyCharges"])

        actual_churn = True if str(row.get("Churn")).strip().lower() == "yes" else False

        c = Customer(
            customer_code=str(row["customerID"]),
            gender=str(row["gender"]),
            senior_citizen=bool(int(row["SeniorCitizen"])),
            partner=str(row["Partner"]),
            dependents=str(row["Dependents"]),
            tenure=int(row["tenure"]),
            phone_service=str(row["PhoneService"]),
            multiple_lines=str(row["MultipleLines"]),
            internet_service=str(row["InternetService"]),
            online_security=str(row["OnlineSecurity"]),
            online_backup=str(row["OnlineBackup"]),
            device_protection=str(row["DeviceProtection"]),
            tech_support=str(row["TechSupport"]),
            streaming_tv=str(row["StreamingTV"]),
            streaming_movies=str(row["StreamingMovies"]),
            contract=str(row["Contract"]),
            paperless_billing=str(row["PaperlessBilling"]),
            payment_method=str(row["PaymentMethod"]),
            monthly_charges=round(float(row["MonthlyCharges"]), 2),
            total_charges=round(float(total_charges), 2),
            actual_churn=actual_churn
        )
        customers_to_insert.append(c)

    # Bulk insert in batches
    batch_size = 500
    for i in range(0, len(customers_to_insert), batch_size):
        db.bulk_save_objects(customers_to_insert[i:i + batch_size])
        db.commit()
        logger.info(f"Inserted batch {i + 1} to {min(i + batch_size, len(customers_to_insert))}...")

    logger.info(f"Successfully imported {len(customers_to_insert)} customers.")

    # Create initial sample predictions using the trained model
    try:
        user = db.query(User).first()
        model_ver = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        if user and model_ver:
            sample_customers = db.query(Customer).limit(20).all()
            for cust in sample_customers:
                cust_dict = {
                    "gender": cust.gender,
                    "SeniorCitizen": 1 if cust.senior_citizen else 0,
                    "Partner": cust.partner,
                    "Dependents": cust.dependents,
                    "tenure": cust.tenure,
                    "PhoneService": cust.phone_service,
                    "MultipleLines": cust.multiple_lines,
                    "InternetService": cust.internet_service,
                    "OnlineSecurity": cust.online_security,
                    "OnlineBackup": cust.online_backup,
                    "DeviceProtection": cust.device_protection,
                    "TechSupport": cust.tech_support,
                    "StreamingTV": cust.streaming_tv,
                    "StreamingMovies": cust.streaming_movies,
                    "Contract": cust.contract,
                    "PaperlessBilling": cust.paperless_billing,
                    "PaymentMethod": cust.payment_method,
                    "MonthlyCharges": cust.monthly_charges,
                    "TotalCharges": cust.total_charges
                }
                pred_churn, prob, risk, _ = predictor.predict(cust_dict)
                pred_rec = Prediction(
                    customer_id=cust.id,
                    created_by=user.id,
                    model_version_id=model_ver.id,
                    predicted_churn=pred_churn,
                    churn_probability=prob,
                    risk_level=risk,
                    input_snapshot=cust_dict
                )
                db.add(pred_rec)
            db.commit()
            logger.info("Sample predictions created successfully.")
    except Exception as e:
        logger.warning(f"Could not seed sample predictions: {e}")

    db.close()

if __name__ == "__main__":
    import_telco_data()
