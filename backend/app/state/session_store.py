from typing import Dict
from app.models.session_state import SessionState

# Global in-memory session store (shared across routes)
SESSION_STORE: Dict[str, SessionState] = {}
