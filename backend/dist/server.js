import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { env } from "./config/env.js";
import { createClient } from "@deepgram/sdk";
// Services and Managers
import { MeetingService } from "./meeting/meeting.service.js";
import { MeetingManager } from "./meeting/meeting.manager.js";
import { ConnectionManager } from "./websocket/connection.manager.js";
import { TranscriptProcessor } from "./transcription/transcript.processor.js";
// Handlers and Routers
import { createMeetingRouter } from "./routes/meeting.routes.js";
import { MeetingSocketHandler } from "./websocket/meeting.socket.js";
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });
// Setup middleware
app.use(cors());
app.use(express.json());
// Initialize services
const meetingService = new MeetingService();
const meetingManager = new MeetingManager(meetingService);
const connectionManager = new ConnectionManager();
const transcriptProcessor = new TranscriptProcessor();
// Initialize handlers
const socketHandler = new MeetingSocketHandler(connectionManager, meetingManager, meetingService, transcriptProcessor);
// REST Routing
app.use("/meetings", createMeetingRouter(meetingService));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "healthy", connections: connectionManager.getRoomSize("main") });
});
// Upgrade HTTP request to WebSocket connection
server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    const pathname = url.pathname;
    // Support route format: /meetings/:id
    const meetingIdMatch = pathname.match(/^\/meetings\/([^/]+)$/);
    if (meetingIdMatch) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });
    }
    else {
        socket.destroy();
    }
});
// Attach WebSocket server connection events
wss.on("connection", (ws, req) => {
    socketHandler.handleConnection(ws, req);
});
// Start Server
server.listen(env.PORT, async () => {
    console.log(`[server] Server listening on http://localhost:${env.PORT}`);
    console.log(`[server] WebSocket listening on wss://localhost:${env.PORT}/meetings/:meetingId`);
    if (env.DEEPGRAM_API_KEY) {
        try {
            const deepgram = createClient(env.DEEPGRAM_API_KEY);
            const { error } = await deepgram.manage.getProjects();
            if (error) {
                console.error(`[server] ❌ Deepgram API connection failed:`, error);
            }
            else {
                console.log(`[server] ✅ Deepgram API connected successfully!`);
            }
        }
        catch (err) {
            console.error(`[server] ❌ Deepgram API connection failed:`, err);
        }
    }
    else {
        console.warn(`[server] ⚠️ No DEEPGRAM_API_KEY found. Running in mock mode.`);
    }
});
