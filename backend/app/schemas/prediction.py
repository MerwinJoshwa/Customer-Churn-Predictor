from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    customer_id: Optional[int] = Field(None, description="Optional existing customer DB ID")
    gender: str = Field("Male", description="Male / Female")
    SeniorCitizen: int = Field(0, description="0 or 1")
    Partner: str = Field("No", description="Yes / No")
    Dependents: str = Field("No", description="Yes / No")
    tenure: int = Field(1, description="Tenure in months", ge=0)
    PhoneService: str = Field("Yes", description="Yes / No")
    MultipleLines: str = Field("No", description="Yes / No / No phone service")
    InternetService: str = Field("DSL", description="DSL / Fiber optic / No")
    OnlineSecurity: str = Field("No", description="Yes / No / No internet service")
    OnlineBackup: str = Field("No", description="Yes / No / No internet service")
    DeviceProtection: str = Field("No", description="Yes / No / No internet service")
    TechSupport: str = Field("No", description="Yes / No / No internet service")
    StreamingTV: str = Field("No", description="Yes / No / No internet service")
    StreamingMovies: str = Field("No", description="Yes / No / No internet service")
    Contract: str = Field("Month-to-month", description="Month-to-month / One year / Two year")
    PaperlessBilling: str = Field("Yes", description="Yes / No")
    PaymentMethod: str = Field("Electronic check", description="Electronic check / Mailed check / Bank transfer (automatic) / Credit card (automatic)")
    MonthlyCharges: float = Field(29.85, description="Monthly charges amount", ge=0)
    TotalCharges: float = Field(29.85, description="Total charges accumulated", ge=0)

class PredictionResult(BaseModel):
    id: Optional[int] = None
    customer_id: Optional[int] = None
    customer_code: Optional[str] = None
    predicted_churn: bool
    churn_probability: float
    risk_level: str  # LOW, MEDIUM, HIGH
    input_snapshot: Dict[str, Any]
    model_version: str
    created_at: Optional[datetime] = None
    created_by_name: Optional[str] = None
    top_risk_factors: Optional[List[Dict[str, Any]]] = None

class ModelMetricsResponse(BaseModel):
    id: Optional[int] = None
    version: str
    model_name: str
    accuracy: float
    precision_score: float
    recall_score: float
    f1_score: float
    roc_auc: float
    confusion_matrix: Optional[List[List[int]]] = None
    trained_at: Optional[datetime] = None
    is_active: bool

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class DashboardStatsResponse(BaseModel):
    total_customers: int
    overall_churn_rate: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_predictions: int
    churn_distribution: Dict[str, int]
    contract_distribution: Dict[str, int]
    payment_method_distribution: Dict[str, int]
    recent_high_risk: List[Dict[str, Any]]
