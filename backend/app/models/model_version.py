from sqlalchemy import Column, BigInteger, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    version = Column(String(30), unique=True, nullable=False)
    model_name = Column(String(100), nullable=False)
    artifact_path = Column(String(255), nullable=True)
    accuracy = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=False)

    predictions = relationship("Prediction", back_populates="model_version")
