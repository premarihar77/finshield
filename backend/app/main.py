from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import ping_database
from app.routes import analysis_routes, auth_routes, chatbot_routes, checker_routes, dashboard_routes, feedback_routes, public_routes, report_routes
from app.services.seed_service import seed_scam_patterns


settings = get_settings()

app = FastAPI(
    title="FinShield API",
    description="AI-style UPI fraud and scam risk analysis API.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(analysis_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(report_routes.router)
app.include_router(feedback_routes.router)
app.include_router(public_routes.router)
app.include_router(checker_routes.router)
app.include_router(chatbot_routes.router)


@app.on_event("startup")
async def startup_event():
    await seed_scam_patterns()


@app.get("/")
async def root():
    return {
        "message": "FinShield API is running",
        "disclaimer": "FinShield provides risk-based analysis and awareness support. It does not replace official bank, NPCI, or police verification.",
    }


@app.get("/health")
async def health():
    await ping_database()
    return {"status": "ok", "database": "connected"}
