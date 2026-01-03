from fastapi import APIRouter
from typing import List
from app.models.session_state import SessionState
from app.state.session_store import SESSION_STORE

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"]
)

@router.get("/sessions", response_model=List[SessionState])
async def get_all_sessions():
    return list(SESSION_STORE.values())
