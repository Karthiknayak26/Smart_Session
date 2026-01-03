import React, { useEffect, useRef, useState, useCallback } from 'react';

const CAPTURE_INTERVAL_MS = 200; // 5 FPS capture rate

const CameraView = ({ onFrameCapture, onError }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [isStreamActive, setIsStreamActive] = useState(false);

    // Capture a single frame from the video feed
    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !isStreamActive) return;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG base64 string (0.6 quality for bandwidth efficiency)
        const frameData = canvas.toDataURL('image/jpeg', 0.6);

        if (onFrameCapture) {
            onFrameCapture(frameData);
        }
    }, [isStreamActive, onFrameCapture]);

    // Initialize camera stream
    useEffect(() => {
        let stream = null;
        let captureInterval = null;

        const initCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        frameRate: { max: 30 }
                    },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Set stream active only after metadata loads (video dimensions available)
                    videoRef.current.onloadedmetadata = () => setIsStreamActive(true);
                }

                // Start the frame capture loop
                captureInterval = setInterval(captureFrame, CAPTURE_INTERVAL_MS);

            } catch (err) {
                console.error("Camera initialization failed:", err);
                let message = "Could not access camera.";

                if (err.name === 'NotAllowedError') {
                    message = "Permission denied. Please allow camera access.";
                } else if (err.name === 'NotFoundError') {
                    message = "No camera device found.";
                } else if (err.name === 'NotReadableError') {
                    message = "Camera is likely in use by another app.";
                }

                setError(message);
                if (onError) onError(message);
            }
        };

        initCamera();

        return () => {
            // Cleanup: Stop stream tracks and clear interval
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (captureInterval) {
                clearInterval(captureInterval);
            }
        };
    }, [captureFrame, onError]);

    return (
        <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-xl aspect-video border border-gray-800">
            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Feed (mirrored for simpler UX) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isStreamActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Loading State */}
            {!isStreamActive && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <div className="w-8 h-8 border-2 border-t-blue-500 border-gray-600 rounded-full animate-spin" />
                    <span className="text-sm font-medium">Starting Camera...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/90 text-center p-6">
                    <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-400 font-semibold mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Active Indicator Overlay */}
            {isStreamActive && !error && (
                <div className="absolute top-4 right-4 flex items-center bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 box-shadow-green" />
                    <span className="text-xs text-green-400 font-mono font-bold tracking-wider">LIVE • 5FPS</span>
                </div>
            )}
        </div>
    );
};

export default CameraView;
