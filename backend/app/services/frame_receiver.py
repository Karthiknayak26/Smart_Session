import base64
import numpy as np
import cv2
import logging

logger = logging.getLogger("FrameReceiver")

class FrameReceiver:
    def decode_frame(self, frame_data: str) -> np.ndarray:
        """
        Decodes a Base64 string into a valid OpenCV image (numpy array).
        Returns None if decoding fails to ensure system resilience.
        """
        try:
            # 1. Sanitize Data (Remove Data URI prefix if present)
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]

            # 2. Decode Base64 -> Bytes
            img_bytes = base64.b64decode(frame_data)
            
            # 3. Convert Bytes -> Numpy Buffer
            np_arr = np.frombuffer(img_bytes, np.uint8)
            
            # 4. Decode Buffer -> Image
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                logger.warning("Decoded frame is None (Corruption?).")
                return None
            
            return frame

        except Exception as e:
            logger.error(f"Frame Decoding Error: {e}")
            return None

# Singleton instance
frame_receiver = FrameReceiver()
