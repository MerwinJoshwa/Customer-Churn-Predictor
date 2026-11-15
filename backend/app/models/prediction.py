import enum
from sqlalchemy import Column, BigInteger, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    model_version_id = Column(BigInteger, ForeignKey("model_versions.id"), nullable=False)
    predicted_churn = Column(Boolean, nullable=False)
    churn_probability = Column(Float, nullable=False)
    risk_level = Column(String(10), nullable=False, index=True)
    input_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    customer = relationship("Customer", back_populates="predictions")
    user = relationship("User", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")
