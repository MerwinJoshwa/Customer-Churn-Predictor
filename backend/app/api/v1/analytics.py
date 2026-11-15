from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.prediction import DashboardStatsResponse
from app.services.prediction_service import prediction_service
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=DashboardStatsResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = prediction_service.get_dashboard_analytics(db)
    return stats
