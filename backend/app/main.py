import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import init_db
from app.ml.predictor import predictor

from app.api.v1.auth import router as auth_router
from app.api.v1.customers import router as customers_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.model import router as model_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed users
    logger.info("Initializing database and models...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")

    # Load ML model
    try:
        predictor.load_model()
    except Exception as e:
        logger.warning(f"Could not load ML model on startup: {e}")

    yield
    # Shutdown logic if any
    logger.info("Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Customer Churn Prediction & Analytics Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(customers_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(model_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "model_loaded": predictor.model is not None,
        "model_version": settings.MODEL_VERSION
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the Customer Churn Predictor API",
        "docs_url": "/docs",
        "version": settings.VERSION
    }
