from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import logging

# Services
from app.services.frame_receiver import frame_receiver
from app.services.cv_pipeline import cv_pipeline
from app.services.proctoring import proctoring_engine, ProctoringAlert
from app.services.confusion import confusion_engine
from app.state.session_store import SESSION_STORE

# Shared State (MVP)
# The SESSION_STORE is now imported from app.state.session_store

# Models
from app.models.session_state import SessionState, StudentStatus, AlertType

# Define Router
router = APIRouter(
    prefix="/student",
    tags=["Student"]
)

# Logger
logger = logging.getLogger("StudentRoute")

import time

# Input Model
class FramePayload(BaseModel):
    studentId: str
    sessionId: str
    frameData: str # Base64 string

@router.post("/process-frame", response_model=SessionState)
async def process_frame(payload: FramePayload):
    """
    Main processing loop for student frames.
    1. Decode Frame
    2. Extract Landmarks (Face Count)
    3. Evaluate Proctoring Rules
    4. Evaluate Confusion Rules
    5. Return Session State
    """
    try:
        start_time = time.time()
        
        # 1. Decode Frame
        frame = frame_receiver.decode_frame(payload.frameData)
        if frame is None:
            # Corrupted frame, just return previous/default state but don't crash
            logger.warning(f"Frame decoding failed for {payload.studentId}")
            raise HTTPException(status_code=400, detail="Invalid frame data")

        # 2. CV Pipeline (Advanced)
        try:
            cv_result = cv_pipeline.process_frame(frame)
            logger.info("CV Pipeline executed successfully")
        except Exception as e:
            logger.error(f"CV Pipeline Failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        face_count = cv_result["face_count"]
        metrics = cv_result["metrics"] # {gaze, brow, smile}
        
        # 3. Proctoring Check (Includes Gaze)
        integrity_alert = proctoring_engine.evaluate(face_count, metrics.get("gaze", "CENTER"))
        
        # 4. Engagement Analysis (Emotion/Confusion)
        raw_emotion = confusion_engine.calculate_state(metrics.get("brow", 0.0), metrics.get("smile", 0.0))
        is_confused = confusion_engine.update_state(payload.studentId, raw_emotion)
        
        # 5. Final State Machine (Strict Priority)
        current_status = StudentStatus.FOCUSED
        current_alert = AlertType.NONE

        # (1) DISTRACTED
        if integrity_alert == ProctoringAlert.NO_FACE:
            current_status = StudentStatus.DISTRACTED
            current_alert = AlertType.NO_FACE
        elif integrity_alert == ProctoringAlert.MULTIPLE_FACES:
            current_status = StudentStatus.DISTRACTED
            current_alert = AlertType.MULTIPLE_FACES
        
        # (2) CONFUSED (Sustained)
        elif is_confused:
             current_status = StudentStatus.CONFUSED
        
        # (3) HAPPY / FOCUSED
        elif raw_emotion == "HAPPY":
             # Optional: Could have a HAPPY status, or just map to FOCUSED with high engagement
             current_status = StudentStatus.FOCUSED 
        else:
             current_status = StudentStatus.FOCUSED

        # Define numeric score for dashboard compatibility
        confusion_score = 70.0 if is_confused else 0.0

        # Create Response Object
        session_state = SessionState(
            student_id=payload.studentId,
            session_id=payload.sessionId,
            status=current_status,
            alert=current_alert,
            face_count=face_count,
            confusion_score=confusion_score
        )
        
        # Processing Time
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Processed {payload.studentId} in {processing_time:.2f}ms: Faces={face_count}, Alert={current_alert.value}, Score={confusion_score}")
        
        
        # Update Global Store
        SESSION_STORE[payload.studentId] = session_state
        
        return session_state

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal processing error"
        )
