// backend/services/websocketService.js
const WebSocket = require('ws');

// A map to hold connections for each roomCode
// Structure: { roomCode: Set<WebSocket> }
const rooms = new Map();

// A map to associate each WebSocket client with their roomCode and user_id (optional, for later)
// Structure: Map<WebSocket, { roomCode: string, userId: number, isHost: boolean }>
const clientRoomMap = new Map();

let wss; // WebSocket Server instance

/**
 * Initializes the WebSocket server.
 * @param {http.Server} server - The HTTP server instance to attach the WebSocket server to.
 */
const initializeWebSocketServer = (server) => {
    if (wss) {
        console.warn('WebSocket server already initialized. Skipping re-initialization.');
        return;
    }

    wss = new WebSocket.Server({ server });

    wss.on('listening', () => {
        console.log('WebSocket Server: Successfully started listening for connections.');
    });

    wss.on('connection', (ws, req) => {
        const ip = req.socket.remoteAddress;
        console.log(`WebSocket Server: Client connected from ${ip}. Total clients: ${wss.clients.size}`);

        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                console.log(`WebSocket Server: Received message from client (IP: ${ip}):`, parsedMessage);

                switch (parsedMessage.type) {
                    case 'join_room':
                        const roomCode = parsedMessage.roomCode;
                        const userId = parsedMessage.userId;
                        const isHost = parsedMessage.isHost;

                        if (!roomCode) {
                            console.warn(`WebSocket Server: Client ${ip} sent join_room without roomCode.`);
                            ws.send(JSON.stringify({ type: 'error', message: 'Room code is required to join.' }));
                            return;
                        }

                        // Add client to the room
                        if (!rooms.has(roomCode)) {
                            rooms.set(roomCode, new Set());
                            console.log(`WebSocket Server: Created new room: ${roomCode}`);
                        }
                        rooms.get(roomCode).add(ws);
                        clientRoomMap.set(ws, { roomCode, userId, isHost });
                        console.log(`WebSocket Server: Client ${ip} joined room: ${roomCode}. Clients in this room: ${rooms.get(roomCode).size}`);

                        // Optional: Broadcast current players to the newly joined client
                        // This would require fetching the current match state (players/scores) from DB
                        // and sending it back. For now, rely on host broadcasting on updates.
                        break;
                    default:
                        console.warn(`WebSocket Server: Unhandled message type from ${ip}: ${parsedMessage.type}`);
                        break;
                }
            } catch (error) {
                console.error(`WebSocket Server: Error parsing or handling message from ${ip}:`, error);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
            }
        });

        ws.on('close', (code, reason) => {
            console.log(`WebSocket Server: Client disconnected from ${ip}. Code: ${code}, Reason: ${reason}`);
            // Remove client from its room when it disconnects
            const clientInfo = clientRoomMap.get(ws);
            if (clientInfo) {
                const { roomCode } = clientInfo;
                if (rooms.has(roomCode)) {
                    rooms.get(roomCode).delete(ws);
                    if (rooms.get(roomCode).size === 0) {
                        rooms.delete(roomCode); // Clean up empty rooms
                        console.log(`WebSocket Server: Room ${roomCode} is now empty and removed.`);
                    }
                    console.log(`WebSocket Server: Client left room ${roomCode}. Remaining clients: ${rooms.has(roomCode) ? rooms.get(roomCode).size : 0}`);
                }
                clientRoomMap.delete(ws);
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket Server: Error for client ${ip}:`, error);
        });
    });

    console.log('WebSocket Server: Initialization requested.');
};

/**
 * Broadcasts a message to all clients in a specific room.
 * @param {string} roomCode - The room code to broadcast to.
 * @param {Object} message - The message payload to send.
 */
const broadcastToRoom = (roomCode, message) => {
    const clientsInRoom = rooms.get(roomCode);
    if (clientsInRoom) {
        console.log(`WebSocket Server: Attempting to broadcast message of type "${message.type}" to room ${roomCode}. Target clients: ${clientsInRoom.size}`);
        clientsInRoom.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            } else {
                console.warn(`WebSocket Server: Client in room ${roomCode} is not open, skipping send.`);
            }
        });
    } else {
        console.warn(`WebSocket Server: No clients in room ${roomCode} to broadcast message of type "${message.type}".`);
    }
};

module.exports = {
    initializeWebSocketServer,
    broadcastToRoom,
    // Optional: Add a getter for connected clients or rooms for debugging if needed
    getRooms: () => rooms,
    getConnectedClients: () => wss ? wss.clients.size : 0
};
