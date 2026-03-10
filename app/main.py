import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.v1.router import api_router as api_v1_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import Base, engine, get_db


configure_logging()
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.backend_cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """
    Hook de démarrage pour loguer et s'assurer que les tables existent.
    (Les enums / triggers sont créés via le script SQL postgres.txt).
    """
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["health"])
def health_check(db: Session = Depends(get_db)) -> JSONResponse:
    """
    Simple healthcheck avec test rapide de la base.
    """
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "database": "down"},
        )

    return JSONResponse(
        status_code=200,
        content={"status": "ok", "database": "up"},
    )


app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

