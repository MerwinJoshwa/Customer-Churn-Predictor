from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.prediction import Prediction
from app.models.customer import Customer
from app.models.model_version import ModelVersion
from app.models.user import User
from app.schemas.prediction import PredictionInput, PredictionResult
from app.ml.predictor import predictor
from app.core.config import settings

class PredictionService:
    @staticmethod
    def create_prediction(
        db: Session,
        input_data: PredictionInput,
        user_id: int
    ) -> Dict[str, Any]:
        # Convert schema to dict snapshot
        input_dict = input_data.model_dump()
        customer_id = input_dict.pop("customer_id", None)

        # Execute ML prediction
        predicted_churn, churn_probability, risk_level, risk_factors = predictor.predict(input_dict)

        # Get or create active model version
        active_version = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        if not active_version:
            active_version = db.query(ModelVersion).first()
            if not active_version:
                active_version = ModelVersion(
                    version=settings.MODEL_VERSION,
                    model_name="Random Forest Classifier",
                    artifact_path=predictor.get_artifact_path(),
                    is_active=True
                )
                db.add(active_version)
                db.commit()
                db.refresh(active_version)

        # Create prediction record
        prediction = Prediction(
            customer_id=customer_id,
            created_by=user_id,
            model_version_id=active_version.id,
            predicted_churn=predicted_churn,
            churn_probability=churn_probability,
            risk_level=risk_level,
            input_snapshot=input_dict
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        # Fetch customer code if customer_id is provided
        customer_code = None
        if customer_id:
            cust = db.query(Customer).filter(Customer.id == customer_id).first()
            if cust:
                customer_code = cust.customer_code

        user = db.query(User).filter(User.id == user_id).first()
        user_name = user.name if user else "Analyst"

        return {
            "id": prediction.id,
            "customer_id": customer_id,
            "customer_code": customer_code,
            "predicted_churn": predicted_churn,
            "churn_probability": churn_probability,
            "risk_level": risk_level,
            "input_snapshot": input_dict,
            "model_version": active_version.version,
            "created_at": prediction.created_at,
            "created_by_name": user_name,
            "top_risk_factors": risk_factors
        }

    @staticmethod
    def get_predictions(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        customer_code: Optional[str] = None,
        risk_level: Optional[str] = None
    ) -> Tuple[int, List[Dict[str, Any]]]:
        query = db.query(Prediction).join(ModelVersion, Prediction.model_version_id == ModelVersion.id)
        
        if customer_code:
            query = query.join(Customer, Prediction.customer_id == Customer.id, isouter=True)
            query = query.filter(Customer.customer_code.ilike(f"%{customer_code.strip()}%"))

        if risk_level and risk_level != "ALL":
            query = query.filter(Prediction.risk_level == risk_level)

        total = query.count()
        records = query.order_by(desc(Prediction.created_at)).offset(skip).limit(limit).all()

        results = []
        for p in records:
            results.append({
                "id": p.id,
                "customer_id": p.customer_id,
                "customer_code": p.customer.customer_code if p.customer else "Custom Guest",
                "predicted_churn": p.predicted_churn,
                "churn_probability": float(p.churn_probability),
                "risk_level": p.risk_level,
                "input_snapshot": p.input_snapshot,
                "model_version": p.model_version.version if p.model_version else settings.MODEL_VERSION,
                "created_at": p.created_at,
                "created_by_name": p.user.name if p.user else "System",
                "top_risk_factors": []
            })

        return total, results

    @staticmethod
    def get_dashboard_analytics(db: Session) -> Dict[str, Any]:
        total_customers = db.query(Customer).count()
        churned_customers = db.query(Customer).filter(Customer.actual_churn == True).count()
        retained_customers = db.query(Customer).filter(Customer.actual_churn == False).count()
        unknown_customers = db.query(Customer).filter(Customer.actual_churn.is_(None)).count()

        overall_churn_rate = round((churned_customers / total_customers * 100), 2) if total_customers > 0 else 0.0

        total_predictions = db.query(Prediction).count()
        high_risk_count = db.query(Prediction).filter(Prediction.risk_level == "HIGH").count()
        medium_risk_count = db.query(Prediction).filter(Prediction.risk_level == "MEDIUM").count()
        low_risk_count = db.query(Prediction).filter(Prediction.risk_level == "LOW").count()

        # Contract distribution
        contract_counts = db.query(Customer.contract, func.count(Customer.id)).group_by(Customer.contract).all()
        contract_dist = {str(c or "Unknown"): cnt for c, cnt in contract_counts}

        # Payment method distribution
        payment_counts = db.query(Customer.payment_method, func.count(Customer.id)).group_by(Customer.payment_method).all()
        payment_dist = {str(p or "Unknown"): cnt for p, cnt in payment_counts}

        # Recent high risk predictions
        recent_high = db.query(Prediction).filter(Prediction.risk_level == "HIGH").order_by(desc(Prediction.created_at)).limit(6).all()
        recent_high_list = [
            {
                "id": p.id,
                "customer_id": p.customer_id,
                "customer_code": p.customer.customer_code if p.customer else "Guest",
                "churn_probability": float(p.churn_probability),
                "risk_level": p.risk_level,
                "created_at": p.created_at
            }
            for p in recent_high
        ]

        return {
            "total_customers": total_customers,
            "overall_churn_rate": overall_churn_rate,
            "high_risk_count": high_risk_count,
            "medium_risk_count": medium_risk_count,
            "low_risk_count": low_risk_count,
            "total_predictions": total_predictions,
            "churn_distribution": {
                "churned": churned_customers,
                "retained": retained_customers,
                "unknown": unknown_customers
            },
            "contract_distribution": contract_dist,
            "payment_method_distribution": payment_dist,
            "recent_high_risk": recent_high_list
        }

prediction_service = PredictionService()
