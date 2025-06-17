// backend/services/socketManager.js

let ioInstance; // Variable to hold the Socket.IO server instance

/**
 * Initializes the Socket.IO event listeners.
 * This function should be called ONCE when the server starts.
 * @param {Server} socketIoServer - The Socket.IO Server instance (from server.js).
 */
const initializeSocketIO = (socketIoServer) => {
    if (ioInstance) {
        console.warn('Socket.IO server already initialized in socketManager. Skipping re-initialization.');
        return;
    }
    ioInstance = socketIoServer;

    ioInstance.on('connection', (socket) => {
        console.log(`Socket.IO Backend: A client connected with ID: ${socket.id}. Total clients: ${ioInstance.engine.clientsCount}`);

        // Client wants to join a specific match room (e.g., when MatchController mounts)
        socket.on('joinMatchRoom', (roomCode) => {
            if (typeof roomCode === 'string' && roomCode.length > 0) {
                socket.join(roomCode);
                console.log(`Socket.IO Backend: Client ${socket.id} joined room: ${roomCode}. Clients in room: ${ioInstance.sockets.adapter.rooms.get(roomCode)?.size || 0}`);
            } else {
                console.warn(`Socket.IO Backend: Invalid roomCode received from ${socket.id} for joinMatchRoom.`);
            }
        });

        // Client is leaving a specific match room (e.g., when MatchController unmounts)
        socket.on('leaveMatchRoom', (roomCode) => {
            if (typeof roomCode === 'string' && roomCode.length > 0) {
                socket.leave(roomCode);
                console.log(`Socket.IO Backend: Client ${socket.id} left room: ${roomCode}. Clients remaining in room: ${ioInstance.sockets.adapter.rooms.get(roomCode)?.size || 0}`);
            } else {
                console.warn(`Socket.IO Backend: Invalid roomCode received from ${socket.id} for leaveMatchRoom.`);
            }
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`Socket.IO Backend: Client disconnected with ID: ${socket.id}. Reason: ${reason}. Total clients: ${ioInstance.engine.clientsCount}`);
            // Socket.IO automatically handles leaving rooms on disconnect for sockets that explicitly joined.
        });

        // Add more custom client-to-server event listeners here if needed (e.g., 'playerAction', 'chatMessage')
    });

    console.log('Socket.IO Backend: Event listeners initialized.');
};

/**
 * Broadcasts a message (event and data) to all clients in a specific room.
 * This function will be called from your Express controllers.
 * @param {string} roomCode - The room code to broadcast to.
 * @param {Object} data - The data payload to send with the event. Must contain a 'type' property.
 */
const broadcastToRoom = (roomCode, data) => {
    if (ioInstance) {
        if (!data || !data.type) {
            console.error("Socket.IO Backend: Broadcast data must contain a 'type' property.", data);
            return;
        }
        console.log(`Socket.IO Backend: Emitting event type "${data.type}" to room "${roomCode}" with data:`, data);
        ioInstance.to(roomCode).emit('match_event', data); // Emit a generic 'match_event' with the data object
    } else {
        console.error("Socket.IO Backend: Not initialized. Cannot broadcast event.");
    }
};

module.exports = {
    initializeSocketIO,
    broadcastToRoom
};
