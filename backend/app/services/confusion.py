import time
import logging

logger = logging.getLogger("ConfusionEngine")

class ConfusionEngine:
    """
    Robust MVP Confusion Logic.
    Triggers 'Confused' only after sustained presence without distraction.
    """
    def __init__(self):
        # Tuned for Demo: 1.0s (was 3.0s) for instant feedback
        self.TIME_WINDOW_SECONDS = 1.0
        self.state = {}

    def calculate_state(self, brow_score: float, smile_score: float) -> str:
        """
        Returns 'CONFUSED', 'HAPPY', or 'FOCUSED'
        """
        # Happy Rule
        if smile_score > 0.5:
             return "HAPPY"

        # Confusion Rule
        # Brow furrowed (High Score) AND No Smile
        # Tuned: Brow > 0.35 is sufficient for subtle expressions
        if brow_score > 0.35 and smile_score < 0.3:
            return "CONFUSED"

        return "FOCUSED"

    def update_state(self, student_id: str, current_emotion: str) -> bool:
        """
        Persistence Check.
        Returns True if 'CONFUSED' is sustained for N seconds.
        """
        now = time.time()
        if student_id not in self.state:
            self.state[student_id] = {"start": None, "last_emotion": "FOCUSED"}

        # Only track persistence for CONFUSED
        if current_emotion == "CONFUSED":
            if self.state[student_id]["start"] is None:
                self.state[student_id]["start"] = now
            elif now - self.state[student_id]["start"] >= self.TIME_WINDOW_SECONDS:
                return True
        else:
            self.state[student_id]["start"] = None

        return False


confusion_engine = ConfusionEngine()
