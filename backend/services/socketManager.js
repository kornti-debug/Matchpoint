/**
 * @fileoverview Socket.IO manager for Matchpoint real-time communication
 * @author cc241070
 * @version 1.0.0
 * @description Handles WebSocket connections, room management, and real-time broadcasting
 */

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

/** @type {import('socket.io').Server|null} Socket.IO server instance */
let socketIoServerInstance = null;

// ============================================================================
// SOCKET.IO INITIALIZATION
// ============================================================================

/**
 * Initializes Socket.IO event listeners and connection handling
 * This function should be called ONCE when the server starts
 * Sets up room management and client lifecycle events
 * 
 * @param {import('socket.io').Server} socketIoServer - The Socket.IO Server instance
 * @throws {Error} If Socket.IO server is already initialized
 */
const initializeSocketIO = (socketIoServer) => {
    if (socketIoServerInstance) {
        console.warn('Socket.IO server already initialized in socketManager. Skipping re-initialization.');
        return;
    }
    
    socketIoServerInstance = socketIoServer;

    // Set up connection event handler
    socketIoServerInstance.on('connection', handleClientConnection);

    console.log('Socket.IO Backend: Event listeners initialized successfully.');
};

/**
 * Handles new client connections and sets up event listeners
 * Manages room joining/leaving and client lifecycle
 * 
 * @param {import('socket.io').Socket} socket - The connected socket instance
 */
const handleClientConnection = (socket) => {
    console.log(`Socket.IO Backend: Client connected with ID: ${socket.id}. Total clients: ${socketIoServerInstance.engine.clientsCount}`);

    // ============================================================================
    // ROOM MANAGEMENT EVENTS
    // ============================================================================

    /**
     * Handles client joining a specific match room
     * Validates room code and adds client to room
     */
    socket.on('joinMatchRoom', (roomCode) => {
        const normalizedRoomCode = roomCode.toUpperCase();
        if (isValidRoomCode(normalizedRoomCode)) {
            socket.join(normalizedRoomCode);
            const roomSize = socketIoServerInstance.sockets.adapter.rooms.get(normalizedRoomCode)?.size || 0;
            console.log(`Socket.IO Backend: Client ${socket.id} joined room: ${roomCode}. Clients in room: ${roomSize}`);
        } else {
            console.warn(`Socket.IO Backend: Invalid roomCode received from ${socket.id} for joinMatchRoom: ${roomCode}`);
        }
    });

    /**
     * Handles client leaving a specific match room
     * Validates room code and removes client from room
     */
    socket.on('leaveMatchRoom', (roomCode) => {
        const normalizedRoomCode = roomCode.toUpperCase();
        if (isValidRoomCode(normalizedRoomCode)) {
            socket.leave(normalizedRoomCode);
            const roomSize = socketIoServerInstance.sockets.adapter.rooms.get(normalizedRoomCode)?.size || 0;
            console.log(`Socket.IO Backend: Client ${socket.id} left room: ${normalizedRoomCode}. Clients remaining in room: ${roomSize}`);
        } else {
            console.warn(`Socket.IO Backend: Invalid roomCode received from ${socket.id} for leaveMatchRoom: ${roomCode}`);
        }
    });

    // ============================================================================
    // CLIENT LIFECYCLE EVENTS
    // ============================================================================

    /**
     * Handles client disconnection
     * Logs disconnection reason and updates client count
     */
    socket.on('disconnect', (reason) => {
        console.log(`Socket.IO Backend: Client disconnected with ID: ${socket.id}. Reason: ${reason}. Total clients: ${socketIoServerInstance.engine.clientsCount}`);
        // Socket.IO automatically handles leaving rooms on disconnect
    });

    // ============================================================================
    // CUSTOM GAME EVENTS (Future expansion)
    // ============================================================================

    // Add more custom client-to-server event listeners here as needed:
    // - 'playerAction' - For real-time player interactions
    // - 'chatMessage' - For in-game chat functionality
    // - 'gameVote' - For voting mechanisms
    // - 'playerReady' - For ready state management
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates if a room code is valid for Socket.IO operations
 * 
 * @param {string} roomCode - The room code to validate
 * @returns {boolean} True if room code is valid, false otherwise
 */
const isValidRoomCode = (roomCode) => {
    return typeof roomCode === 'string' && roomCode.length > 0;
};

// ============================================================================
// BROADCASTING FUNCTIONS
// ============================================================================

/**
 * Broadcasts a message to all clients in a specific room
 * Used by Express controllers to send real-time updates
 * 
 * @param {string} roomCode - The room code to broadcast to
 * @param {Object} eventData - The data payload to send
 * @param {string} eventData.type - The event type identifier
 * @param {*} eventData.* - Additional event-specific data
 * @returns {void}
 * 
 * @example
 * // Broadcast player update
 * broadcastToRoom('1234', {
 *   type: 'players_update',
 *   players: updatedPlayers,
 *   scores: updatedScores
 * });
 * 
 * @example
 * // Broadcast match start
 * broadcastToRoom('1234', {
 *   type: 'match_started',
 *   match: matchData
 * });
 */
const broadcastToRoom = (roomCode, eventData) => {
    if (!socketIoServerInstance) {
        console.error("Socket.IO Backend: Server not initialized. Cannot broadcast event.");
        return;
    }

    if (!eventData || !eventData.type) {
        console.error("Socket.IO Backend: Broadcast data must contain a 'type' property.", eventData);
        return;
    }

    console.log(`Socket.IO Backend: Broadcasting "${eventData.type}" to room "${roomCode}":`, eventData);
    
    // Emit a generic 'match_event' with the data object
    // Frontend listens for 'match_event' and handles different types
    socketIoServerInstance.to(roomCode).emit('match_event', eventData);
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    initializeSocketIO,
    broadcastToRoom
};
