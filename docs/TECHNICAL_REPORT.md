# SmartSession Technical Report

This document details the engineering decisions, architectural patterns, and custom logic implementation for the SmartSession project.

## 1. Architectural Decisions

### Hybrid Communication Strategy (WebSocket + HTTP Polling)
SmartSession employs a **hybrid communication architecture** to ensure both low latency and high reliability.

*   **Primary Channel (WebSockets)**: Used for real-time state updates (confusion, focus status). This achieves sub-100ms latency, providing the "live" feel necessary for a proctoring tool.
*   **Reliability Layer (HTTP Polling)**: A fallback mechanism and initial state fetcher. If the WebSocket connection drops (e.g., firewall issues, temporary network partitions), the client can still fetch the latest session state via standard HTTP GET requests. This ensures the dashboard never shows stale data indefinitely.

### Latency Considerations
*   **Frame Processing**: The computer vision pipeline runs asynchronously to the main application thread to prevent blocking.
*   **State Broadcast**: Updates are broadcast only on state change or periodically (heartbeat) to minimize bandwidth usage.

### Edge Case Handling
*   **Camera Disconnects**: The system detects a stream interruption and flags the student status as `OFFLINE` after a grace period, preventing false positive "cheating" alerts.
*   **Corrupted Frames**: Invalid or partial frames from the client are dropped silently by the CV pipeline to prevent backend crashes, ensuring system stability.

## 2. Confusion Detection Logic (Explainable AI)

### Philosophy: Confusion as a Cognitive State
We treat "Confusion" as a distinct cognitive state characterized by sustained mental effort and uncertainty, rather than a fleeting emotion like "sadness" or "anger". We avoided black-box Deep Learning emotion classifiers because they are often opaque and prone to bias.

### White-Box "Confusion" Heuristic
Instead, we use an **Explainable AI** approach based on facial geometry. The logic is deterministic and easy to audit:

1.  **Face Mesh Analysis**: We use MediaPipe to extract 468 facial landmarks.
2.  **Brow Furrow Detection**: We calculate the vertical distance between the eyebrows and the eyes. A significant decrease indicates "furrowing" (intense concentration or confusion).
3.  **Smile Exclusion**: To avoid false positives (e.g., a student laughing while focusing), any detected smile overrides the confusion signal.

### Logic Rule
```python
# Simplified Logic from services/confusion.py

IF (Brow_Furrow_Score > 0.35) AND (Smile_Score < 0.3):
    Current_State = "POTENTIALLY_CONFUSED"
ELSE:
    Current_State = "FOCUSED"

# Temporal smoothing: The state must persist for > 1.0 seconds to trigger a dashboard alert.
```

## 3. Code Structure & Integrity

The backend is structured to be **modular, testable, and deterministic**.

### Service-Oriented Architecture
*   **`services/cv_pipeline.py`**: Pure computer vision logic. It takes an image and returns raw metrics (landmarks, vectors). It knows nothing about "students" or "sessions".
*   **`services/confusion.py`**: Pure business logic. It takes raw metrics and applies the heuristic rules described above. It is stateless and easily unit-tested.
*   **`services/proctoring.py`**: Handles gaze estimation and unauthorized object detection logic.
*   **`routes/`**: Handles HTTP/WebSocket transport and delegates work to services.

### Separation of Concerns
This separation ensures that tweaking the sensitivity of the confusion detection (business logic) does not require touching the complex MediaPipe integration (CV infrastructure). It makes the codebase easy to reason about and debug.

## 4. UI / UX Considerations

### Teacher-First Design
 The dashboard is designed for **glanceability**. A teacher managing 30+ students cannot read complex graphs in real-time.

### Visual Status System
*   **🟢 Green (Focused)**: Everything is normal. Visual noise is minimized.
*   **🟡 Yellow (Confused)**: A subtle highlight to draw attention to students who might need help.
*   **🔴 Red (Distracted/Alert)**: Immediate visual cue for proctoring violations (e.g., looking away, multiple faces).

### Responsiveness
The UI prioritizes stability over flashy animations. Status updates snap to the new state immediately to provide accurate real-time feedback.
