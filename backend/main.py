from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routes.complaints import router as complaint_router

load_dotenv()

# Import models so tables get created
from models.complaint import Complaint

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Complaint AI System",
    description="AI-powered complaint management for pharma industry",
    version="1.0.0"
)

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(complaint_router)

@app.get("/")
def root():
    return {"message": "Complaint AI System is running! ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}