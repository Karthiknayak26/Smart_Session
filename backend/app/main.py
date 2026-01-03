import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.student import router as student_router
from app.routes.teacher import router as teacher_router

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartSessionBackend")

app = FastAPI(title="SmartSession Backend", version="1.0.0")

# CORS Configuration
# Allow frontend (localhost:3000) to communicate with backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # debugging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(teacher_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Backend starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Backend shutting down...")

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to verify backend is running.
    """
    return {"status": "ok", "service": "smartsession-backend"}

@app.get("/")
async def root():
    return {"message": "SmartSession Backend is Live"}
