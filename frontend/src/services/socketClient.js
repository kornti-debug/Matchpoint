// src/services/socketClient.js
import { io } from "socket.io-client";

// Define your backend Socket.IO URL
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL; // IMPORTANT: Ensure this matches your backend HTTP/Socket.IO server port
console.log("Socket.IO Client: Using SOCKET_SERVER_URL:", SOCKET_SERVER_URL);
let socket = null; // Private variable to hold the socket instance
let currentRoomCode = null

/**
 * Connects to the Socket.IO server and joins a specific match room.
 * @param {string} roomCode - The room code for the match to join.
 */
export const connectSocket = (roomCode) => {

    if (!SOCKET_SERVER_URL) {
        console.error("Socket.IO Client: SOCKET_SERVER_URL is not defined. Check your .env files.");
        return;
    }

    currentRoomCode = roomCode;
    // If socket exists and is already connected, no need to create a new one.
    // Just ensure it's in the right room by re-emitting 'joinMatchRoom'.
    if (socket && socket.connected && socket.io.uri === SOCKET_SERVER_URL) {
        console.log(`Socket.IO Client: Already connected to ${SOCKET_SERVER_URL}. Re-emitting joinMatchRoomor: ${currentRoomCode}`);
        socket.emit('joinMatchRoom', currentRoomCode); // Ensure we use currentRoomCode
        return;
    }

    console.log(`Socket.IO Client: Attempting to establish NEW connection to: ${SOCKET_SERVER_URL} for room: ${currentRoomCode}`);
    socket = io(SOCKET_SERVER_URL, {
        reconnection: true,             // Enable reconnection attempts
        reconnectionAttempts: Infinity, // Unlimited reconnection attempts
        reconnectionDelay: 1000,        // Start with 1 second delay
        reconnectionDelayMax: 5000,     // Max delay 5 seconds
        timeout: 20000,                 // Connection timeout
        transports: ['websocket'],      // Prioritize WebSockets
        withCredentials: true,          // Include cookies with the connection (if any)
        auth: {                         // Custom authentication data (e.g., JWT)
            token: localStorage.getItem('token')
        }
    });

    // Event listeners for the Socket.IO client
    socket.on('connect', () => {
        console.log(`Socket.IO Client: CONNECTED to server with ID: ${socket.id}. Attempting to join room: ${currentRoomCode}`);
        // Emit event to join the specific match room as soon as connected
        socket.emit('joinMatchRoom', currentRoomCode);
    });

    socket.on('disconnect', (reason) => {
        console.log(`Socket.IO Client: DISCONNECTED from server. Reason: ${reason}. Socket ID: ${socket.id}`);
    });

    socket.on('connect_error', (error) => {
        console.error(`Socket.IO Client: Connection error: ${error.message}. Please check SOCKET_SERVER_URL and backend server status/firewall.`);
        console.error(`Socket.IO Client: Connect error details:`, error);
        if (error.message.includes('Authentication error') || error.message.includes('Forbidden')) {
            console.error('Socket.IO Client: Authentication failed. User might need to log in again or token is invalid.');
            // Optionally, force logout or redirect to login page here
            // Example: localStorage.removeItem('token'); window.location.href = '/login';
        }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket.IO Client: Reconnect attempt #${attemptNumber}`);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket.IO Client: RECONNECTED successfully after ${attemptNumber} attempts. New Socket ID: ${socket.id}. Re-emitting joinMatchRoom for: ${currentRoomCode}`);
        // Re-join room on reconnect, in case the server forgot
        socket.emit('joinMatchRoom', currentRoomCode);
    });

    socket.on('reconnect_error', (error) => {
        console.error(`Socket.IO Client: Reconnection error: ${error.message}`);
    });

    socket.on('reconnect_failed', () => {
        console.error('Socket.IO Client: Reconnection failed permanently.');
    });

    socket.on('error', (error) => {
        console.error(`Socket.IO Client: General error: ${error.message}`);
    });

};


/**
 * Registers an event listener for a Socket.IO event.
 * @param {string} eventName - The name of the event to listen for.
 * @param {function} callback - The callback function to execute when the event occurs.
 */
export const onSocketEvent = (eventName, callback) => {
    if (socket) {
        console.log(`Socket.IO Client: Registering listener for event: ${eventName}`);
        socket.on(eventName, callback);
    } else {
        console.warn(`Socket.IO Client: Socket not connected. Cannot register listener for ${eventName}.`);
    }
};

/**
 * Removes an event listener for a Socket.IO event.
 * @param {string} eventName - The name of the event to remove the listener from.
 * @param {function} callback - The original callback function that was registered.
 */
export const offSocketEvent = (eventName, callback) => {
    if (socket) {
        console.log(`Socket.IO Client: Removing listener for event: ${eventName}`);
        socket.off(eventName, callback);
    }
};

/**
 * Emits a Socket.IO event to the server.
 * @param {string} eventName - The name of the event to emit.
 * @param {object} data - The data to send with the event.
 */
export const emitSocketEvent = (eventName, data) => {
    if (socket) {
        console.log(`Socket.IO Client: Emitting event: ${eventName} with data:`, data);
        socket.emit(eventName, data);
    } else {
        console.warn(`Socket.IO Client: Socket not connected. Cannot emit event: ${eventName}.`);
    }
};

/**
 * Disconnects the main Socket.IO connection.
 * @param {string} roomCode - The room code to leave.
 */
export const disconnectSocket = (roomCode) => {
    if (socket) {
        console.log(`Socket.IO Client: Emitting leave_room for: ${roomCode}. Socket ID: ${socket.id}`); // Add Socket ID
        socket.emit('leaveMatchRoom', roomCode); // Tell server you're leaving the room
        // Do NOT call socket.disconnect() here unless it's a full app shutdown,
        // as connectSocket already handles reconnection attempts.
        // For simple room changes, just leaving the room on the server side is enough.
        // If you truly need to sever the connection: socket.disconnect();
    }
};

/**
 * Checks if the socket is currently connected.
 * @returns {boolean} True if connected, false otherwise.
 */
export const isSocketConnected = () => {
    return socket && socket.connected;
};
