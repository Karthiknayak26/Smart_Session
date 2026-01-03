// frontend/teacher/api.js

const API_BASE = "http://localhost:8000";

/**
 * Fetches latest session states from the real backend.
 */
export async function fetchStudentStates() {
    try {
        const res = await fetch(`${API_BASE}/teacher/sessions`);
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return await res.json();
    } catch (err) {
        console.error("Teacher API error:", err);
        return [];
    }
}
