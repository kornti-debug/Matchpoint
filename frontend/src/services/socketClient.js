// src/services/socketClient.js
import { io } from "socket.io-client";

// Define your backend Socket.IO URL
const SOCKET_SERVER_URL = "http://localhost:3000"; // IMPORTANT: Ensure this matches your backend HTTP/Socket.IO server port

let socket = null; // Private variable to hold the socket instance

/**
 * Connects to the Socket.IO server and joins a specific match room.
 * @param {string} roomCode - The room code for the match to join.
 */
export const connectSocket = (roomCode) => {
    // If socket exists and is already connected, no need to create a new one.
    // Just ensure it's in the right room by re-emitting 'joinMatchRoom'.
    if (socket && socket.connected) {
        console.log('Socket.IO Client: Already connected. Ensuring presence in room:', roomCode);
        socket.emit('joinMatchRoom', roomCode);
        return;
    }

    console.log('Socket.IO Client: Attempting to establish new connection for room:', roomCode);
    socket = io(SOCKET_SERVER_URL, {
        // Optional: Pass JWT token for authentication if your Socket.IO server requires it
        auth: { token: localStorage.getItem('token') }
    });

    // Event listeners for the Socket.IO client
    socket.on('connect', () => {
        console.log('Socket.IO Client: Connected to server with ID:', socket.id);
        // Emit event to join the specific match room as soon as connected
        socket.emit('joinMatchRoom', roomCode);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO Client: Disconnected from server. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO Client: Connection Error:', error.message);
    });
};

/**
 * Disconnects the Socket.IO client.
 * @param {string} roomCode - The room code of the match to leave (optional, for server notification).
 */
export const disconnectSocket = (roomCode) => {
    if (socket && socket.connected) { // Only disconnect if socket exists and is connected
        console.log('Socket.IO Client: Disconnecting and attempting to leave room:', roomCode);
        if (roomCode) {
            socket.emit('leaveMatchRoom', roomCode); // Inform server we are leaving
        }
        socket.disconnect(); // Disconnects the socket
    }
    socket = null; // Clear the instance regardless of prior connection status
};

/**
 * Registers a listener for a specific Socket.IO event.
 * @param {string} eventName - The name of the event to listen for.
 * @param {Function} callback - The callback function to execute when the event is received.
 */
export const onSocketEvent = (eventName, callback) => {
    if (socket) {
        socket.on(eventName, callback);
    } else {
        console.warn(`Socket.IO Client: Not connected. Cannot register listener for '${eventName}'.`);
    }
};

/**
 * Removes a listener for a specific Socket.IO event.
 * @param {string} eventName - The name of the event to remove the listener from.
 * @param {Function} callback - The specific callback function to remove.
 */
export const offSocketEvent = (eventName, callback) => {
    if (socket) {
        socket.off(eventName, callback);
    }
};

/**
 * Emits an event to the Socket.IO server.
 * @param {string} eventName - The name of the event to emit.
 * @param {*} data - The data to send with the event.
 */
export const emitSocketEvent = (eventName, data) => {
    if (socket && socket.connected) {
        console.log(`Socket.IO Client: Emitting '${eventName}' with data:`, data);
        socket.emit(eventName, data);
    } else {
        console.warn(`Socket.IO Client: Not connected. Cannot emit '${eventName}'.`);
    }
};

/**
 * Checks if the socket is currently connected.
 * @returns {boolean} True if connected, false otherwise.
 */
export const isSocketConnected = () => {
    return socket && socket.connected;
};
