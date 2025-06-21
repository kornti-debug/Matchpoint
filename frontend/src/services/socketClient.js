/**
 * @fileoverview Socket.IO client service for Matchpoint frontend
 * @author cc241070
 * @version 1.0.0
 * @description Handles WebSocket connections, room management, and real-time communication with backend
 */

import { io } from "socket.io-client";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Socket.IO server URL from environment variables
 * Falls back to localhost:3000 for development
 * @type {string}
 */

//const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const SOCKET_SERVER_URL = "wss://cc241070-10748.node.fhstp.cc:10748";

// ============================================================================
// GLOBAL STATE
// ============================================================================

/** @type {import('socket.io-client').Socket|null} Active socket connection instance */
let socketInstance = null;

/** @type {string|null} Currently joined room code */
let currentRoomCode = null;

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Establishes Socket.IO connection and joins a specific match room
 * Handles reconnection, authentication, and room management
 * 
 * @param {string} roomCode - The room code for the match to join
 * @returns {void}
 * 
 * @example
 * // Connect to match room
 * connectSocket('1234');
 */
export const connectSocket = (roomCode) => {
    if (!SOCKET_SERVER_URL) {
        console.error("Socket.IO Client: SOCKET_SERVER_URL is not defined. Check your .env files.");
        return;
    }

    const normalizedRoomCode = roomCode.toLowerCase();
    currentRoomCode = normalizedRoomCode;

    // Reuse existing connection if already connected to the same server
    if (socketInstance && socketInstance.connected && socketInstance.io.uri === SOCKET_SERVER_URL) {
        socketInstance.emit('joinMatchRoom', currentRoomCode);
        return;
    }

    // Create new socket connection with optimized settings
    socketInstance = io(SOCKET_SERVER_URL, {
        reconnection: true,             // Enable automatic reconnection
        reconnectionAttempts: Infinity, // Unlimited reconnection attempts
        reconnectionDelay: 1000,        // Initial delay: 1 second
        reconnectionDelayMax: 5000,     // Maximum delay: 5 seconds
        timeout: 20000,                 // Connection timeout: 20 seconds
        transports: ['websocket'],      // Use WebSocket transport
        withCredentials: true,          // Include cookies for authentication
        auth: {                         // Authentication data
            token: localStorage.getItem('token')
        }
    });

    // Set up connection event handlers
    setupConnectionEventHandlers();
};

/**
 * Sets up all Socket.IO event handlers for connection lifecycle
 * Handles connect, disconnect, errors, and reconnection events
 * 
 * @private
 */
const setupConnectionEventHandlers = () => {
    if (!socketInstance) return;

    // ============================================================================
    // CONNECTION EVENTS
    // ============================================================================

    /**
     * Handles successful connection to Socket.IO server
     */
    socketInstance.on('connect', () => {
        console.log(`Socket.IO Client: CONNECTED to server with ID: ${socketInstance.id}. Joining room: ${currentRoomCode}`);
        socketInstance.emit('joinMatchRoom', currentRoomCode);
    });

    /**
     * Handles disconnection from Socket.IO server
     */
    socketInstance.on('disconnect', (reason) => {
        console.log(`Socket.IO Client: DISCONNECTED from server. Reason: ${reason}. Socket ID: ${socketInstance.id}`);
    });

    // ============================================================================
    // ERROR HANDLING
    // ============================================================================

    /**
     * Handles connection errors and authentication failures
     */
    socketInstance.on('connect_error', (error) => {
        console.error(`Socket.IO Client: Connection error: ${error.message}`);
        console.error(`Socket.IO Client: Error details:`, error);
        
        if (error.message.includes('Authentication error') || error.message.includes('Forbidden')) {
            console.error('Socket.IO Client: Authentication failed. User may need to log in again.');
            // TODO: Implement automatic logout/redirect to login
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
    });

    /**
     * Handles general socket errors
     */
    socketInstance.on('error', (error) => {
        console.error(`Socket.IO Client: General error: ${error.message}`);
    });

    // ============================================================================
    // RECONNECTION EVENTS
    // ============================================================================

    /**
     * Handles reconnection attempts
     */
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket.IO Client: Reconnect attempt #${attemptNumber}`);
    });

    /**
     * Handles successful reconnection
     */
    socketInstance.on('reconnect', (attemptNumber) => {
        console.log(`Socket.IO Client: RECONNECTED after ${attemptNumber} attempts. New Socket ID: ${socketInstance.id}`);
        // Re-join room after reconnection
        socketInstance.emit('joinMatchRoom', currentRoomCode);
    });

    /**
     * Handles reconnection errors
     */
    socketInstance.on('reconnect_error', (error) => {
        console.error(`Socket.IO Client: Reconnection error: ${error.message}`);
    });

    /**
     * Handles permanent reconnection failure
     */
    socketInstance.on('reconnect_failed', () => {
        console.error('Socket.IO Client: Reconnection failed permanently.');
    });
};

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

/**
 * Registers an event listener for Socket.IO events
 * Used by components to listen for real-time updates
 * 
 * @param {string} eventName - The name of the event to listen for
 * @param {Function} callback - The callback function to execute when event occurs
 * @returns {void}
 * 
 * @example
 * // Listen for match events
 * onSocketEvent('match_event', (data) => {
 *   console.log('Match update received:', data);
 * });
 */
export const onSocketEvent = (eventName, callback) => {
    if (socketInstance) {
        socketInstance.on(eventName, callback);
    } else {
        console.warn(`Socket.IO Client: Socket not connected. Cannot register listener for ${eventName}.`);
    }
};

/**
 * Removes an event listener for Socket.IO events
 * Important for cleanup to prevent memory leaks
 * 
 * @param {string} eventName - The name of the event to remove listener from
 * @param {Function} callback - The original callback function that was registered
 * @returns {void}
 * 
 * @example
 * // Remove event listener
 * offSocketEvent('match_event', handleMatchEvent);
 */
export const offSocketEvent = (eventName, callback) => {
    if (socketInstance) {
        socketInstance.off(eventName, callback);
    }
};

/**
 * Emits a Socket.IO event to the server
 * Used for sending data to the backend
 * 
 * @param {string} eventName - The name of the event to emit
 * @param {*} data - The data to send with the event
 * @returns {void}
 * 
 * @example
 * // Send player action
 * emitSocketEvent('playerAction', { action: 'vote', choice: 'A' });
 */
export const emitSocketEvent = (eventName, data) => {
    if (socketInstance) {
        socketInstance.emit(eventName, data);
    } else {
        console.warn(`Socket.IO Client: Socket not connected. Cannot emit event: ${eventName}.`);
    }
};

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

/**
 * Leaves a match room and optionally disconnects from server
 * Called when component unmounts or user leaves match
 * 
 * @param {string} roomCode - The room code to leave
 * @returns {void}
 * 
 * @example
 * // Leave match room
 * disconnectSocket('1234');
 */
export const disconnectSocket = (roomCode) => {
    if (socketInstance) {
        const normalizedRoomCode = roomCode.toLowerCase();
        console.log(`Socket.IO Client: Leaving room: ${normalizedRoomCode}. Socket ID: ${socketInstance.id}`);
        
        // Tell server we're leaving the room
        socketInstance.emit('leaveMatchRoom', normalizedRoomCode);
        
        // Note: We don't disconnect the socket here to allow for room switching
        // Only disconnect on full app shutdown or explicit logout
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if the socket is currently connected to the server
 * 
 * @returns {boolean} True if connected, false otherwise
 * 
 * @example
 * if (isSocketConnected()) {
 *   console.log('Socket is connected');
 * }
 */
export const isSocketConnected = () => {
    return socketInstance && socketInstance.connected;
};
