/*// services/websocketService.js
class WebSocketService {
    constructor() {
        this.socket = null;
    }

    connect(roomCode, userRole) {
        this.socket = new WebSocket(`ws://localhost:3000/match/${roomCode}`);

        this.socket.onopen = () => {
            console.log('Connected to match');
            // Tell server who you are
            this.socket.send(JSON.stringify({
                type: 'join',
                role: userRole,
                token: localStorage.getItem('token')
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
    }

    handleMessage(data) {
        // Emit events that components can listen to
        window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));
    }

    sendMessage(message) {
        if (this.socket) {
            this.socket.send(JSON.stringify(message));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export default new WebSocketService();*/