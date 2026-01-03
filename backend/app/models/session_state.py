from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List
from datetime import datetime

class StudentStatus(Enum):
    FOCUSED = "FOCUSED"
    CONFUSED = "CONFUSED"
    DISTRACTED = "DISTRACTED"
    OFFLINE = "OFFLINE"

class AlertType(Enum):
    NONE = "NONE"
    MULTIPLE_FACES = "MULTIPLE_FACES"
    NO_FACE = "NO_FACE"
    UNAUTHORIZED_OBJECT = "UNAUTHORIZED_OBJECT"
    GAZE_AWAY = "GAZE_AWAY"

class SessionState(BaseModel):
    """
    Represents the real-time state of a student.
    Sent to the Teacher Dashboard.
    """
    student_id: str
    session_id: str
    
    # Core Status
    status: StudentStatus = StudentStatus.FOCUSED
    alert: AlertType = AlertType.NONE
    
    # Telemetry
    face_count: int = 1
    confusion_score: float = 0.0 # 0-100
    
    # Metadata
    last_updated: float = Field(default_factory=lambda: datetime.now().timestamp())
    
    class Config:
        use_enum_values = True
