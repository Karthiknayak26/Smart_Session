import React, { useState, useEffect } from 'react';
import { fetchStudentStates } from "./api";

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [timeline, setTimeline] = useState({}); // Stores history per student
    const [connectionStatus, setConnectionStatus] = useState('CONNECTED');

    // Polling Logic
    useEffect(() => {
        const loadStudents = async () => {
            const data = await fetchStudentStates();
            setStudents(data);

            // Update Timeline
            setTimeline(prev => {
                const updated = { ...prev };

                data.forEach(student => {
                    const entry = {
                        status: student.status,
                        alert: student.alert,
                        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                    };

                    if (!updated[student.student_id]) {
                        updated[student.student_id] = [];
                    }

                    updated[student.student_id] = [
                        entry,
                        ...updated[student.student_id]
                    ].slice(0, 10); // keep last 10 entries

                });

                return updated;
            });

            console.log("Teacher dashboard updated with timeline");
        };

        loadStudents(); // initial load

        const interval = setInterval(loadStudents, 3000); // polling
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status, alert) => {
        if (alert && alert !== 'NONE') return 'bg-red-600';
        switch (status) {
            case 'FOCUSED': return 'bg-green-500';
            case 'CONFUSED': return 'bg-yellow-500';
            case 'DISTRACTED': return 'bg-orange-500';
            case 'OFFLINE': return 'bg-gray-500';
            default: return 'bg-blue-500';
        }
    };

    // Helper: Map Confusion Score to Engagement %
    const getEngagementScore = (student) => {
        return Math.max(0, 100 - Math.round(student.confusion_score || 0));
    };

    // Helper: Display Name Fallback
    const getDisplayName = (student) => {
        return student.name || student.student_id;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                        <h1 className="text-xl font-semibold text-gray-800">SmartSession <span className="text-gray-400 font-normal">| Teacher View</span></h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{connectionStatus === 'CONNECTED' ? 'Live System' : 'Disconnected'}</span>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition">
                            End Session
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Students</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Engagement</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {students.length > 0
                                ? Math.round(students.reduce((acc, s) => acc + getEngagementScore(s), 0) / students.length)
                                : 0}%
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-yellow-400">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confused</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-1">
                            {students.filter(s => s.status === 'CONFUSED').length}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</p>
                        <p className="text-3xl font-bold text-red-600 mt-1">
                            {students.filter(s => s.alert !== 'NONE').length}
                        </p>
                    </div>
                </div>

                {/* Grid Title */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Live Classroom Feed</h2>
                    <div className="flex space-x-2">
                        {/* Filter toggles could go here */}
                    </div>
                </div>

                {/* Student Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {students.map((student) => {
                        const score = getEngagementScore(student);

                        return (
                            <div key={student.student_id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group">

                                {/* Dummy Video Preview Area */}
                                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                                    <span className="text-gray-400 text-sm">No Video Feed</span>

                                    {/* Status Indicator Badge */}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${getStatusColor(student.status, student.alert)}`}>
                                        {student.status}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-medium text-gray-900">{getDisplayName(student)}</h3>
                                        <span className="text-xs text-gray-400">{student.student_id}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                        <div
                                            className={`h-1.5 rounded-full ${score < 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${score}%` }}
                                        ></div>
                                    </div>

                                    {/* Timeline Display */}
                                    {timeline[student.student_id] && (
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Activity (Last 30s)</p>
                                            <div className="space-y-1.5">
                                                {timeline[student.student_id].slice(0, 5).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs items-center">
                                                        <span className="text-gray-400 font-mono text-[10px]">{item.time}</span>
                                                        <span className={`font-medium ${item.alert !== 'NONE' ? 'text-red-500' : 'text-gray-600'}`}>
                                                            {item.alert !== "NONE"
                                                                ? item.alert.replace('_', ' ')
                                                                : item.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Overlay (Keep simplified or removed if timeline is enough, kept for advanced detail) */}
                                <div className="absolute inset-0 bg-gray-900/95 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white pointer-events-none">
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="border-b border-gray-700 pb-2 mb-2">
                                            <span className="text-gray-400">ID:</span> {student.student_id}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Faces:</span>
                                            <span>{student.face_count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Score:</span>
                                            <span className={student.confusion_score > 50 ? "text-yellow-400" : "text-green-400"}>
                                                {student.confusion_score}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
