from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import engine
from app.models.models import Base
from app.api import auth, users, vehicles, violations, challans, payments, dashboard
from app.database.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    seed_data()
    yield


app = FastAPI(
    title="FineSnap API",
    description="Smart Digital E-Challan Management System API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(violations.router)
app.include_router(challans.router)
app.include_router(payments.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "FineSnap API v2.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "finesnap-api"}
