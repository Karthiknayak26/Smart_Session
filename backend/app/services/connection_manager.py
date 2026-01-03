from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger("ConnectionManager")

class ConnectionManager:
    """
    Manages WebSocket connections for the Teacher Dashboard.
    Allows broadcasting of real-time session updates.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection established. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Remaining clients: {len(self.active_connections)}")

    async def broadcast(self, message: list):
        """
        Broadcasts a list of session states (dictionaries) to all connected clients.
        """
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                # If send fails, we assume the client is gone, but we wait for the disconnect event to clean up properly.

# Global Instance
manager = ConnectionManager()
