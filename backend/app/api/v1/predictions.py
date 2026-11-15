from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.prediction import PredictionInput, PredictionResult
from app.services.prediction_service import prediction_service
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionResult, status_code=status.HTTP_201_CREATED)
def predict_churn(
    prediction_in: PredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = prediction_service.create_prediction(
        db=db,
        input_data=prediction_in,
        user_id=current_user.id
    )
    return result

@router.get("", response_model=dict)
def get_prediction_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    customer_code: Optional[str] = Query(None, description="Search by customer code"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (LOW, MEDIUM, HIGH)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skip = (page - 1) * limit
    total, items = prediction_service.get_predictions(
        db=db,
        skip=skip,
        limit=limit,
        customer_code=customer_code,
        risk_level=risk_level
    )
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }
