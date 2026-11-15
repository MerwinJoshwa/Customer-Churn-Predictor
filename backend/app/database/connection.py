import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.base import Base
import app.models  # Ensure all models are registered

logger = logging.getLogger(__name__)

engine = None
SessionLocal = None

def get_engine():
    global engine, SessionLocal
    if engine is not None:
        return engine

    # First attempt configured DATABASE_URL (MySQL)
    try:
        test_engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected successfully to database: {settings.DATABASE_URL}")
        engine = test_engine
    except Exception as e:
        if settings.FALLBACK_SQLITE:
            logger.warning(f"Could not connect to primary database ({e}). Falling back to SQLite: {settings.SQLITE_URL}")
            engine = create_engine(
                settings.SQLITE_URL,
                connect_args={"check_same_thread": False}
            )
        else:
            raise e

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine

def get_session() -> Session:
    global SessionLocal
    if SessionLocal is None:
        get_engine()
    return SessionLocal()

def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.close()

def init_db():
    eng = get_engine()
    Base.metadata.create_all(bind=eng)
    
    # Seed default Admin and Analyst if not existing
    from app.models.user import User
    from app.core.security import get_password_hash
    
    db = get_session()
    try:
        admin_user = db.query(User).filter(User.email == "admin@telecom.com").first()
        if not admin_user:
            admin_user = User(
                name="System Administrator",
                email="admin@telecom.com",
                password_hash=get_password_hash("admin123"),
                role="ADMIN"
            )
            db.add(admin_user)

        analyst_user = db.query(User).filter(User.email == "analyst@telecom.com").first()
        if not analyst_user:
            analyst_user = User(
                name="Lead Churn Analyst",
                email="analyst@telecom.com",
                password_hash=get_password_hash("analyst123"),
                role="ANALYST"
            )
            db.add(analyst_user)
            
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial users: {e}")
    finally:
        db.close()
