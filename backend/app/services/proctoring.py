from enum import Enum
import logging
import time

logger = logging.getLogger("ProctoringEngine")

class ProctoringAlert(Enum):
    CLEAN = "CLEAN"
    NO_FACE = "NO_FACE_DETECTED"
    MULTIPLE_FACES = "MULTIPLE_FACES_DETECTED"
    GAZE_AWAY = "GAZE_AWAY_DETECTED"

class ProctoringEngine:
    def __init__(self):
        self.gaze_start_time = None
        # Tuned: 3.0s (was 4.0s) to consistently trigger alert in demo
        self.GAZE_THRESHOLD_SECONDS = 3.0

    def evaluate(self, face_count: int, gaze_direction: str) -> ProctoringAlert:
        """
        Evaluate frame data against strict proctoring rules.
        """
        
        # 1. Face Count Rules (Immediate)
        if face_count == 0:
            self.gaze_start_time = None
            return ProctoringAlert.NO_FACE
            
        if face_count > 1:
            self.gaze_start_time = None
            return ProctoringAlert.MULTIPLE_FACES
            
        # 2. Gaze Analysis (Persistence)
        if gaze_direction != "CENTER":
            if self.gaze_start_time is None:
                self.gaze_start_time = time.time()
                
            # Check duration
            duration = time.time() - self.gaze_start_time
            if duration > self.GAZE_THRESHOLD_SECONDS:
                return ProctoringAlert.GAZE_AWAY
        else:
            # Reset if they look back
            self.gaze_start_time = None
            
        return ProctoringAlert.CLEAN

# Singleton
proctoring_engine = ProctoringEngine()
