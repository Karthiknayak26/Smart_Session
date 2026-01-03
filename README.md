# SmartSession – Real-Time Student Engagement & Proctoring System

SmartSession is a real-time classroom monitoring system designed to help teachers understand **student engagement** and **proctoring integrity** during online sessions.

The system focuses on **explainable logic**, **modular architecture**, and **graceful real-time processing**, rather than black-box AI models.

---

## 🎯 Problem Statement

In online learning environments, instructors lack visibility into:
- Student focus and confusion
- Proctoring violations (no face, multiple faces)
- Sustained disengagement over time

SmartSession addresses this by analyzing live camera frames and presenting **clear, interpretable session states** to the teacher.

---

## 🧠 Design Philosophy

- **Explainable over opaque AI**
- **Rule-based logic** before ML complexity
- **Incremental development**
- **Fail-safe backend processing**
- **Teacher-first UI (glanceable, not noisy)**

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Student Camera (Browser)] --> B[Frontend (React)]
    B --> C[Backend (FastAPI)]
    C --> D[Frame Decoder]
    D --> E[CV Pipeline]
    E --> F[Proctoring Engine]
    F --> G[Confusion Engine]
    G --> H[Session State Aggregation]
    H --> I[Teacher Dashboard]
```

---

## 🔧 Technology Stack

### Frontend
- React
- TailwindCSS
- HTTP polling (MVP)
- Modular component structure

### Backend
- FastAPI
- OpenCV
- MediaPipe Face Mesh
- Pydantic models
- In-memory session store (MVP)

---

## 📦 Core Components

### 1. Camera Capture (Student Side)
- Secure camera access
- Frame capture at fixed FPS
- Base64 encoding
- Graceful error handling

### 2. CV Pipeline
- MediaPipe Face Mesh
- Face count detection
- Defensive handling of corrupted frames

### 3. Proctoring Engine
Rule-based checks:
- No face detected
- Multiple faces detected

Stateless by design to avoid false positives.

### 4. Confusion Engine
Custom, explainable logic based on:
- Brow squeeze
- Head tilt
- Persistence over time

Avoids generic emotion classifiers.

### 5. Session State Model
Aggregates:
- Student status
- Proctoring alerts
- Face count
- Confusion score
- Timestamp

This snapshot is consumed directly by the teacher dashboard.

---

## 📊 Teacher Dashboard

- Real-time session snapshots
- Color-coded student states
- Lightweight timeline of recent activity
- HTTP polling (3s interval) for MVP simplicity

---

## ⚡ Performance & Reliability

- End-to-end latency tested and logged
- Typical processing time within acceptable real-time limits
- Corrupted frames handled gracefully
- No backend crashes on invalid input

---

## 🧪 Testing Strategy

- Panic test (forced confusion state)
- Latency sanity checks
- Edge case handling (no face, multiple faces)
- Timeline validation

---

## 🔮 Future Improvements

- WebSocket-based real-time streaming
- Persistent storage (Redis / DB)
- Advanced gaze estimation
- Teacher alerts & notifications
- Multi-session scalability

---

## ▶️ How to Run

### Backend
```bash
uvicorn app.main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```

## 🎥 Demo & Walkthrough

A video walkthrough explains:
1. Architecture decisions
2. End-to-end data flow
3. Panic test demonstration
4. Teacher dashboard behavior

## 🧑‍💻 Author

Developed as part of an internship assignment to demonstrate:
- System thinking
- Real-time data processing
- Explainable AI principles
