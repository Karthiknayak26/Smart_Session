// SmartSession Connection Layer (Mock / WebSocket Wrapper)

class Connection {
    constructor() {
        this.socket = null;
        this.listeners = [];
        this.isConnected = false;
    }

    /**
     * Connects to the backend WebSocket.
     * @param {string} url - The WebSocket URL (e.g., ws://localhost:8000/ws/student)
     */
    connect(url) {
        console.log(`[MockConnection] Connecting to ${url}...`);

        // Mocking a successful connection delay
        setTimeout(() => {
            this.isConnected = true;
            console.log(`[MockConnection] Connected successfully to ${url}`);

            // Notify listeners of open event (mock)
            this._notify({ type: 'OPEN' });
        }, 500);
    }

    /**
     * Sends a message to the backend.
     * @param {object} message - The JSON payload to send.
     */
    send(message) {
        if (!this.isConnected) {
            console.warn('[MockConnection] Cannot send: Not connected.');
            return;
        }

        // Just log it for now (Human-readable verification)
        const size = JSON.stringify(message).length;
        console.log(`[MockConnection] Sending message: ${message.type} (${size} bytes)`);
    }

    /**
     * Registers a callback for incoming messages.
     * @param {function} callback - Function(data)
     */
    onMessage(callback) {
        this.listeners.push(callback);
    }

    /**
     * Disconnects the socket.
     */
    disconnect() {
        if (this.isConnected) {
            console.log('[MockConnection] Disconnecting...');
            this.isConnected = false;
            this._notify({ type: 'CLOSE' });
        }
    }

    // Internal helper to simulate incoming events
    _notify(data) {
        this.listeners.forEach(cb => cb(data));
    }
}

// Export a single instance (Singleton pattern)
const connection = new Connection();
export default connection;
