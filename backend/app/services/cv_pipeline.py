import cv2
import mediapipe as mp
import logging
import math
import numpy as np

logger = logging.getLogger("CVPipeline")

class CVPipeline:
    def __init__(self):
        self.use_fallback = False
        self.face_detector = None
        self.face_mesh = None
        
        # 1. Initialize MediaPipe
        try:
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detector = self.mp_face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=0.5
            )
            
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            logger.info("MediaPipe Initialized (Detection + Mesh)")
        except Exception as e:
            logger.error(f"MediaPipe Init Failed: {e}. Switching to OpenCV Fallback.")
            self.use_fallback = True
            try:
                # Initialize Haar Cascade for fallback face detection
                self.haar_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            except Exception as e2:
                logger.error(f"Haar Init Failed: {e2}")
                self.haar_cascade = None

    def process_frame(self, frame):
        """
        Main Analysis Loop.
        Returns:
        {
            "face_count": int,
            "landmarks": list, 
            "metrics": {
                "gaze": "CENTER", # LEFT, RIGHT, UP, DOWN, CENTER
                "brow": float,    # 0.0 (open) to 1.0 (furrowed)
                "smile": float,   # 0.0 (neutral) to 1.0 (smiling)
            }
        }
        """
        if frame is None:
            return {"face_count": 0, "metrics": {}}

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, _ = frame.shape
        
        results = {
            "face_count": 0,
            "landmarks": None,
            "metrics": {
                "gaze": "CENTER",
                "brow": 0.0,
                "smile": 0.0
            }
        }

        try:
            # 1. Detection
            if self.face_detector:
                detection = self.face_detector.process(rgb)
                if detection.detections:
                    results["face_count"] = len(detection.detections)
            elif self.use_fallback and self.haar_cascade:
                 # Fallback: OpenCV Haar Cascade
                 gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                 faces = self.haar_cascade.detectMultiScale(gray, 1.1, 4)
                 results["face_count"] = len(faces)
            elif self.use_fallback:
                 # Absolute fallback if even Haar fails (unlikely)
                 results["face_count"] = 0 # Default to 0 so we don't assume safe

            # 2. Mesh Analysis (Only if 1 face)
            if results["face_count"] == 1 and self.face_mesh:
                mesh_res = self.face_mesh.process(rgb)
                if mesh_res.multi_face_landmarks:
                    lm = mesh_res.multi_face_landmarks[0]
                    results["landmarks"] = lm
                    
                    # --- COMPUTE METRICS ---
                    results["metrics"]["gaze"] = self._detect_gaze(lm, w, h)
                    results["metrics"]["brow"] = self._calculate_brow_furrow(lm)
                    results["metrics"]["smile"] = self._calculate_smile(lm)
            
            return results

        except Exception as e:
            logger.error(f"Processing Error: {e}")
            return results

    # --- METRIC HELPERS ---

    def _detect_gaze(self, landmarks, img_w, img_h):
        # ROI: Left Eye (Indices 33, 133) + Iris (468)
        # Simple heuristic: Iris position relative to eye corners
        try:
            # Coordinates
            left_eye_inner = landmarks.landmark[133]
            left_eye_outer = landmarks.landmark[33]
            left_iris = landmarks.landmark[468]

            # Horizontal Ratio
            eye_width = left_eye_inner.x - left_eye_outer.x
            if eye_width == 0: return "CENTER"
            
            # Iris distance from outer corner
            iris_dist = left_iris.x - left_eye_outer.x
            ratio = iris_dist / eye_width

            # Thresholds (Tuned)
            if ratio < 0.40: return "LEFT"   # Looking student-right (camera left)
            if ratio > 0.60: return "RIGHT"  # Looking student-left
            
            # Vertical Ratio (optional, simpler to stick to horizontal for MVP)
            return "CENTER"
        except:
            return "CENTER"

    def _calculate_brow_furrow(self, landmarks):
        # Dist: Inner Brows (107, 336) / Face Width (234, 454)
        try:
            brow_dist = abs(landmarks.landmark[107].x - landmarks.landmark[336].x)
            face_width = abs(landmarks.landmark[234].x - landmarks.landmark[454].x)
            if face_width == 0: return 0.0
            
            normalized = brow_dist / face_width
            # Typical range: 0.15 (furrowed) to 0.25 (relaxed)
            # Map to 0.0 - 1.0 (1.0 = most furrowed)
            # score = 1.0 - (normalized - 0.15) * 10 
            # Simplified:
            if normalized < 0.18: return 0.8
            return 0.1
        except:
            return 0.0

    def _calculate_smile(self, landmarks):
        # Dist: Mouth Corners (61, 291) / Face Width
        try:
            mouth_dist = abs(landmarks.landmark[61].x - landmarks.landmark[291].x)
            face_width = abs(landmarks.landmark[234].x - landmarks.landmark[454].x)
            if face_width == 0: return 0.0
            
            ratio = mouth_dist / face_width
            # Typical: 0.35 (neutral), 0.45+ (smile)
            if ratio > 0.45: return 0.9
            return 0.1
        except:
            return 0.0

cv_pipeline = CVPipeline()
