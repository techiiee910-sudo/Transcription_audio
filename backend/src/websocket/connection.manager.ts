import { WebSocket } from "ws";
import { ServerMessage } from "../types/websocket.js";

export class ConnectionManager {
  // meetingId -> Set of WebSockets
  private rooms = new Map<string, Set<WebSocket>>();
  // WebSocket -> meetingId
  private socketToRoom = new Map<WebSocket, string>();

  joinRoom(meetingId: string, socket: WebSocket) {
    let room = this.rooms.get(meetingId);
    if (!room) {
      room = new Set<WebSocket>();
      this.rooms.set(meetingId, room);
    }
    room.add(socket);
    this.socketToRoom.set(socket, meetingId);
  }

  leaveRoom(socket: WebSocket): string | null {
    const meetingId = this.socketToRoom.get(socket);
    if (!meetingId) return null;

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

  broadcastToRoom(meetingId: string, message: ServerMessage, excludeSocket?: WebSocket) {
    const room = this.rooms.get(meetingId);
    if (!room) return;

    const payload = JSON.stringify(message);
    for (const socket of room) {
      if (socket === excludeSocket) continue;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  }

  getRoomSize(meetingId: string): number {
    return this.rooms.get(meetingId)?.size || 0;
  }
}
