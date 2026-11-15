from sqlalchemy import Column, BigInteger, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    customer_code = Column(String(30), unique=True, nullable=False, index=True)
    gender = Column(String(10), nullable=True)
    senior_citizen = Column(Boolean, default=False)
    partner = Column(String(5), nullable=True)
    dependents = Column(String(5), nullable=True)
    tenure = Column(Integer, default=0)
    phone_service = Column(String(30), nullable=True)
    multiple_lines = Column(String(30), nullable=True)
    internet_service = Column(String(30), nullable=True)
    online_security = Column(String(30), nullable=True)
    online_backup = Column(String(30), nullable=True)
    device_protection = Column(String(30), nullable=True)
    tech_support = Column(String(30), nullable=True)
    streaming_tv = Column(String(30), nullable=True)
    streaming_movies = Column(String(30), nullable=True)
    contract = Column(String(30), nullable=True, index=True)
    paperless_billing = Column(String(5), nullable=True)
    payment_method = Column(String(60), nullable=True)
    monthly_charges = Column(Float, nullable=True)
    total_charges = Column(Float, nullable=True)
    actual_churn = Column(Boolean, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    predictions = relationship("Prediction", back_populates="customer", cascade="all, delete-orphan")
