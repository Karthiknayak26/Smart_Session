# SmartSession - Real-Time Student Behavior Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: MVP Development](https://img.shields.io/badge/Status-MVP%20Development-blue.svg)]()

> A production-ready system for real-time student engagement and confusion detection during online learning sessions, built with explainable AI and privacy-first principles.

## 🎯 Project Overview

SmartSession helps teachers understand student engagement and confusion in real-time during online classes and exams, while ensuring academic integrity without invasive surveillance.

### Key Features

- **Real-Time Confusion Detection** - Custom, explainable algorithm using facial landmarks (no black-box AI)
- **Engagement Tracking** - Monitor student attention, gaze direction, and posture
- **Exam Integrity Monitoring** - Detect multiple faces, prolonged absence, unusual behavior
- **Teacher Dashboard** - Aggregate metrics, student grid view, timeline analysis
- **Privacy-First Design** - No video recording, transparent data collection, student consent
- **Robust Edge Case Handling** - Graceful degradation for poor lighting, no camera, network issues

## 🏗️ Architecture

### System Design Principles

1. **Explainability Over Accuracy** - All ML decisions are transparent and rule-based
2. **Privacy by Design** - Live processing only, no persistent biometric storage
3. **Graceful Degradation** - System continues functioning despite hardware/network failures
4. **Human-in-the-Loop** - Teachers review all alerts, no automated punitive actions

### Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- MediaPipe Face Mesh (facial landmark detection)
- WebRTC (video capture)

**Backend:**
- Node.js + Express
- WebSocket (critical alerts only)
- HTTP Polling (2-3s for metrics)

**Computer Vision:**
- MediaPipe Face Mesh (468 facial landmarks)
- Custom confusion detection algorithm
- Client-side processing (privacy + scalability)

## 📊 Confusion Detection Algorithm

Our custom, explainable approach uses weighted scoring of observable indicators:

```
Confusion Score = (Eyebrow Furrow × 0.3) + (Gaze Shifts × 0.4) + 
                  (Head Tilt × 0.2) + (Micro-expressions × 0.1)

Threshold: Score > 0.6 = Confused
```

### Indicators Explained

| Indicator | Weight | Description | Rationale |
|-----------|--------|-------------|-----------|
| **Gaze Shifts** | 40% | Pupil movement away from screen center (>3 shifts/5s) | Primary confusion signal |
| **Eyebrow Furrow** | 30% | Distance between inner eyebrow points decreases | Universal confusion expression |
| **Head Tilt** | 20% | Sustained non-neutral angle (>15° for >3s) | Indicates processing difficulty |
| **Micro-expressions** | 10% | Rapid facial changes (>5% movement in <500ms) | Cognitive load indicator |

**Temporal Smoothing:** 5-second rolling window with 3+ consecutive frames required to reduce false positives.

## 📁 Project Structure

```
SmartSession/
├── docs/
│   ├── architecture/          # System design diagrams
│   ├── problem_understanding.md
│   └── implementation_plan.md
├── backend/
│   ├── server.js             # Express server
│   ├── routes/               # API endpoints
│   ├── controllers/          # Business logic
│   └── utils/                # Helper functions
├── frontend/
│   ├── student/              # Student monitoring interface
│   ├── teacher/              # Teacher dashboard
│   ├── shared/               # Common components
│   └── assets/               # Images, styles
├── tests/                    # Unit and integration tests
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- Modern browser with WebRTC support (Chrome, Firefox, Edge)
- Webcam access

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/SmartSession.git
cd SmartSession

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in separate terminal)
cd frontend
npm run dev
```

Access the application:
- Student Interface: `http://localhost:3000/student`
- Teacher Dashboard: `http://localhost:3000/teacher`

## 📖 Documentation

- [Problem Understanding](docs/problem_understanding.md) - Requirements analysis, trade-offs, ethical considerations
- [Architecture Design](docs/architecture/) - System diagrams, data flow, API specifications
- [Implementation Plan](docs/implementation_plan.md) - Development roadmap, component breakdown
- [User Manual](docs/user_manual.md) - Teacher and student guides

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- confusion-detection

# Run with coverage
npm run test:coverage
```

## 🔒 Privacy & Ethics

### What We Collect
- Facial landmark coordinates (not images)
- Engagement scores (0-100)
- Confusion indicators with explanations
- Session metadata (timestamps, duration)

### What We DON'T Collect
- Video recordings
- Raw webcam frames
- Biometric identifiers
- Personal information beyond session context

### Student Rights
- ✅ See exactly what data is collected
- ✅ Opt-out of monitoring (with teacher notification)
- ✅ Report false positives
- ✅ Data deleted after 24 hours

## 🎓 Use Cases

### During Live Classes
1. Teacher sees 35% of students confused at timestamp 14:23
2. Teacher pauses, re-explains concept
3. Confusion levels drop to 10%
4. Teacher continues lesson

### During Exams
1. System detects multiple faces in Student A's frame
2. Alert sent to teacher with screenshot
3. Teacher reviews context, decides if intervention needed
4. No automated penalties

### Post-Session Analysis
1. Teacher reviews session timeline
2. Identifies topics with high confusion spikes
3. Adjusts future lesson plans
4. Follows up with struggling students

## 🛠️ Development Workflow

All code is **manually written** (no AI-generated boilerplate) per assignment requirements.

### Commit Organization

1. **docs:** Initial problem understanding and requirements
2. **docs:** Architecture design and system diagrams
3. **backend:** Server setup and API structure
4. **backend:** Confusion detection algorithm implementation
5. **frontend:** Student monitoring interface
6. **frontend:** Teacher dashboard
7. **tests:** Unit tests for core logic
8. **docs:** Final documentation and deployment guide

## 🤝 Contributing

This is an assignment project. Contributions are not accepted at this time.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**Nayak**  
Built for nSkills AI Internship Selection Round

## 🙏 Acknowledgments

- MediaPipe team for facial landmark detection
- Educational psychology research on confusion indicators
- Privacy-first design principles from Mozilla and EFF

---

**Note:** This is an MVP built for demonstration purposes. Production deployment requires additional security hardening, scalability testing, and compliance reviews.
