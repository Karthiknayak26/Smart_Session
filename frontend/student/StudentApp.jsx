import React, { useState, useCallback } from 'react';
import CameraView from './CameraView';

const StudentApp = () => {
    // Human-Readable State
    // We only store the LAST frame debug info to show UI updates,
    // avoiding storing the full image in React state to prevent lag.
    const [lastFrameSize, setLastFrameSize] = useState(0);
    const [cameraError, setCameraError] = useState(null);
    const [backendStatus, setBackendStatus] = useState("Checking...");

    // Handler: Receive frame from CameraView
    const handleFrameCapture = useCallback(async (frameData) => {
        // "frameData" is a base64 string
        const sizeInBytes = frameData.length;

        // Log to console as requested for verification
        console.log(`Frame received: ${sizeInBytes} bytes`);

        // Update UI state just to show things are working
        setLastFrameSize(sizeInBytes);

        // Send to Backend (MVP Integration)
        try {
            await fetch('http://localhost:8000/student/process-frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: 'S1', // Hardcoded for MVP Demo
                    sessionId: 'LIVE_SESSION',
                    frameData: frameData
                })
            });
            setBackendStatus("🟢 Connected");
        } catch (err) {
            console.error("Backend Error:", err);
            setBackendStatus("🔴 Backend Offline");
        }
    }, []);

    // Handler: Receive error from CameraView
    const handleCameraError = useCallback((errorMessage) => {
        console.error("Camera Error in App:", errorMessage);
        setCameraError(errorMessage);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 text-blue-400">SmartSession Student Portal</h1>
                <div className="flex space-x-4 justify-center">
                    <p className="text-gray-400">Camera: {cameraError ? "❌ Error" : "🟢 Ready"}</p>
                    <p className="text-gray-400">Backend: {backendStatus}</p>
                </div>
            </header>

            <main className="w-full max-w-4xl flex flex-col items-center space-y-6">

                {/* 1. The Camera Component */}
                <CameraView
                    onFrameCapture={handleFrameCapture}
                    onError={handleCameraError}
                />

                {/* 2. Simple Debug Console (To prove it works without opening DevTools) */}
                <div className="w-full max-w-2xl bg-gray-800 p-4 rounded-lg border border-gray-700 font-mono text-sm">
                    <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">Debug Log</h3>

                    {cameraError ? (
                        <div className="text-red-400">
                            [ERROR] {cameraError}
                        </div>
                    ) : lastFrameSize > 0 ? (
                        <div className="text-green-400 animate-pulse">
                            [INFO] Frame Received • Size: {(lastFrameSize / 1024).toFixed(2)} KB
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            [WAITING] Initializing camera feed...
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default StudentApp;
