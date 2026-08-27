import { WebSocket } from "ws";
export class ConnectionManager {
    // meetingId -> Set of WebSockets
    rooms = new Map();
    // WebSocket -> meetingId
    socketToRoom = new Map();
    joinRoom(meetingId, socket) {
        let room = this.rooms.get(meetingId);
        if (!room) {
            room = new Set();
            this.rooms.set(meetingId, room);
        }
        room.add(socket);
        this.socketToRoom.set(socket, meetingId);
    }
    leaveRoom(socket) {
        const meetingId = this.socketToRoom.get(socket);
        if (!meetingId)
            return null;
        const room = this.rooms.get(meetingId);
        if (room) {
            room.delete(socket);
            if (room.size === 0) {
                this.rooms.delete(meetingId);
            }
        }
        this.socketToRoom.delete(socket);
        return meetingId;
    }
    broadcastToRoom(meetingId, message, excludeSocket) {
        const room = this.rooms.get(meetingId);
        if (!room)
            return;
        const payload = JSON.stringify(message);
        for (const socket of room) {
            if (socket === excludeSocket)
                continue;
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }
    getRoomSize(meetingId) {
        return this.rooms.get(meetingId)?.size || 0;
    }
}
