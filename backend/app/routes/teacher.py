from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from app.models.session_state import SessionState
from app.state.session_store import SESSION_STORE
from app.services.connection_manager import manager
import logging

logger = logging.getLogger("TeacherRoute")

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"]
)

@router.get("/sessions", response_model=List[SessionState])
async def get_all_sessions():
    return list(SESSION_STORE.values())

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        manager.disconnect(websocket)
