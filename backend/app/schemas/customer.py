from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CustomerBase(BaseModel):
    customer_code: str = Field(..., description="Unique customer code identifier")
    gender: Optional[str] = Field("Male", description="Male / Female")
    senior_citizen: Optional[bool] = Field(False, description="Senior citizen indicator")
    partner: Optional[str] = Field("No", description="Yes / No")
    dependents: Optional[str] = Field("No", description="Yes / No")
    tenure: Optional[int] = Field(1, description="Tenure in months", ge=0)
    phone_service: Optional[str] = Field("Yes", description="Yes / No")
    multiple_lines: Optional[str] = Field("No", description="Yes / No / No phone service")
    internet_service: Optional[str] = Field("DSL", description="DSL / Fiber optic / No")
    online_security: Optional[str] = Field("No", description="Yes / No / No internet service")
    online_backup: Optional[str] = Field("No", description="Yes / No / No internet service")
    device_protection: Optional[str] = Field("No", description="Yes / No / No internet service")
    tech_support: Optional[str] = Field("No", description="Yes / No / No internet service")
    streaming_tv: Optional[str] = Field("No", description="Yes / No / No internet service")
    streaming_movies: Optional[str] = Field("No", description="Yes / No / No internet service")
    contract: Optional[str] = Field("Month-to-month", description="Month-to-month / One year / Two year")
    paperless_billing: Optional[str] = Field("Yes", description="Yes / No")
    payment_method: Optional[str] = Field("Electronic check", description="Electronic check / Mailed check / Bank transfer (automatic) / Credit card (automatic)")
    monthly_charges: Optional[float] = Field(29.85, description="Monthly charges amount", ge=0)
    total_charges: Optional[float] = Field(29.85, description="Total charges accumulated", ge=0)
    actual_churn: Optional[bool] = Field(None, description="Actual churn outcome (1=Churn, 0=Stayed, None=Unknown)")

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_code: Optional[str] = None
    gender: Optional[str] = None
    senior_citizen: Optional[bool] = None
    partner: Optional[str] = None
    dependents: Optional[str] = None
    tenure: Optional[int] = None
    phone_service: Optional[str] = None
    multiple_lines: Optional[str] = None
    internet_service: Optional[str] = None
    online_security: Optional[str] = None
    online_backup: Optional[str] = None
    device_protection: Optional[str] = None
    tech_support: Optional[str] = None
    streaming_tv: Optional[str] = None
    streaming_movies: Optional[str] = None
    contract: Optional[str] = None
    paperless_billing: Optional[str] = None
    payment_method: Optional[str] = None
    monthly_charges: Optional[float] = None
    total_charges: Optional[float] = None
    actual_churn: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[CustomerResponse]
