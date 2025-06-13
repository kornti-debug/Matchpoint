const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 });
const rooms = new Map(); // Store rooms and their players

wss.on('connection', (ws) => {


ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log('Received:', data);

    if (data.type === 'join_room') {
        const roomCode = data.roomCode;

        // Add player to room
        if (!rooms.has(roomCode)) {
            rooms.set(roomCode, []);
        }
        rooms.get(roomCode).push('Player ' + Math.random().toString(36).substr(2, 5));

        // Send back player list
        ws.send(JSON.stringify({
            type: 'players_update',
            players: rooms.get(roomCode)
        }));
    }
})
});