import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { WSEvent, ClientMessage, Participant } from "../types/websocket.js";
import { MeetingManager } from "../meeting/meeting.manager.js";
import { ConnectionManager } from "./connection.manager.js";
import { TranscriptProcessor } from "../transcription/transcript.processor.js";
import { MeetingService } from "../meeting/meeting.service.js";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { env } from "../config/env.js";

export class MeetingSocketHandler {
  private activeParticipants = new Map<WebSocket, { meetingId: string; participant: Participant }>();
  
  // Maps WebSocket to a Deepgram LiveClient
  private deepgramClients = new Map<WebSocket, LiveClient>();
  
  // Buffers locked-in words until a speech pause (speech_final)
  private speakerBuffers = new Map<WebSocket, string>();

  // Buffers audio chunks while Deepgram is connecting (readyState === 0)
  private audioChunkBuffers = new Map<WebSocket, Buffer[]>();
  
  // Mock transcript interval references when DEEPGRAM_API_KEY is absent
  private mockIntervals = new Map<WebSocket, NodeJS.Timeout>();

  constructor(
    private connectionManager: ConnectionManager,
    private meetingManager: MeetingManager,
    private meetingService: MeetingService,
    private transcriptProcessor: TranscriptProcessor
  ) {}

  handleConnection(ws: WebSocket, req: IncomingMessage) {
    console.log("[socket] New WebSocket connection established (Deepgram mode)");

    ws.on("message", (rawMessage: Buffer | ArrayBuffer | string, isBinary: boolean) => {
      // 1. Handle Binary Audio Chunks
      if (isBinary) {
        this.handleAudioChunk(ws, rawMessage as Buffer);
        return;
      }

      // 2. Handle JSON Control Messages
      try {
        const message = JSON.parse(rawMessage.toString()) as ClientMessage;
        this.handleControlMessage(ws, message);
      } catch (err) {
        console.error("[socket] Failed to parse control frame:", err);
        ws.send(JSON.stringify({ type: WSEvent.ERROR, message: "Invalid message frame" }));
      }
    });

    ws.on("close", () => {
      this.handleCleanup(ws);
    });

    ws.on("error", (err) => {
      console.error("[socket] Connection error:", err);
      this.handleCleanup(ws);
    });
  }

  private handleControlMessage(ws: WebSocket, message: ClientMessage) {
    switch (message.type) {
      case WSEvent.JOIN: {
        const { meetingId, participant } = message;
        console.log(`[socket] Participant ${participant.name} joining room: ${meetingId}`);

        // Register in connection manager
        this.connectionManager.joinRoom(meetingId, ws);
        this.activeParticipants.set(ws, { meetingId, participant });

        // Add to meeting session
        const roster = this.meetingManager.addParticipant(meetingId, participant);
        const meeting = this.meetingService.getMeeting(meetingId);

        // Sync state back to new connection
        if (meeting) {
          ws.send(JSON.stringify({ type: WSEvent.MEETING_STATE, meeting }));
        }
        
        // Send existing transcript history
        const history = this.meetingManager.getTranscripts(meetingId);
        if (history.length > 0) {
          ws.send(JSON.stringify({ type: WSEvent.TRANSCRIPT_HISTORY, lines: history }));
        }
        
        // Broadcast participant list to room
        this.connectionManager.broadcastToRoom(meetingId, {
          type: WSEvent.PARTICIPANTS,
          participants: roster,
        });

        // Remove Deepgram initialization from JOIN, do it on LIVE instead
        break;
      }

      case WSEvent.LEAVE: {
        this.handleCleanup(ws);
        break;
      }

      case WSEvent.STATUS_CHANGED: {
        const { meetingId, status } = message;
        console.log(`[socket] Meeting ${meetingId} status changed to: ${status}`);

        const info = this.activeParticipants.get(ws);

        if (status === "live" && info) {
          // User started recording. Start Deepgram now so it doesn't timeout in the waiting room.
          this.startDeepgramTranscription(ws, meetingId, info.participant);
        } else if (status === "waiting" && info) {
          // User paused recording. Close Deepgram.
          this.stopTranscription(ws);
        }

        this.meetingService.updateMeetingStatus(meetingId, status);
        this.connectionManager.broadcastToRoom(meetingId, {
          type: WSEvent.STATUS_CHANGED,
          status,
        });
        break;
      }

      case WSEvent.TRANSCRIPT_INTERIM: {
        this.connectionManager.broadcastToRoom(message.meetingId, message, ws);
        break;
      }

      case WSEvent.TRANSCRIPT_FINAL: {
        this.meetingManager.addTranscript(message.meetingId, message.line);
        this.connectionManager.broadcastToRoom(message.meetingId, message, ws);
        break;
      }

      case WSEvent.TRANSCRIPT_CLEAR: {
        console.log(`[socket] Meeting ${message.meetingId} transcript cleared by host.`);
        this.meetingManager.clearTranscripts(message.meetingId);
        this.connectionManager.broadcastToRoom(message.meetingId, {
          type: WSEvent.TRANSCRIPT_CLEAR,
        });
        break;
      }
    }
  }

  private handleAudioChunk(ws: WebSocket, chunk: Buffer | ArrayBuffer) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    
    const dgClient = this.deepgramClients.get(ws);
    if (!dgClient) return;

    const readyState = dgClient.getReadyState();
    
    // 1 = OPEN in standard WebSockets
    if (readyState === 1) { 
      dgClient.send(bufferChunk as any);
    } else if (readyState === 0) {
      // 0 = CONNECTING. Buffer the chunks to prevent dropping the first second of speech.
      const chunks = this.audioChunkBuffers.get(ws) || [];
      chunks.push(bufferChunk);
      this.audioChunkBuffers.set(ws, chunks);
    }
  }

  private startDeepgramTranscription(ws: WebSocket, meetingId: string, participant: Participant) {
    if (!env.DEEPGRAM_API_KEY) {
      console.warn("DEEPGRAM_API_KEY is not set. Falling back to mock transcription.");
      this.startMockTranscriptLoop(ws, meetingId, participant);
      return;
    }

    console.log(`[transcription] Starting Deepgram stream for ${participant.name}`);

    const deepgram = createClient(env.DEEPGRAM_API_KEY);
    const dgConnection = deepgram.listen.live({
      model: "nova-3",
      language: "en",
      smart_format: true,
      interim_results: true,
      endpointing: 300,
      utterance_end_ms: 1000,
      filler_words: true,
      punctuate: true,
      encoding: "linear16",
      sample_rate: 16000,
      channels: 1,
    });

    this.deepgramClients.set(ws, dgConnection);

    dgConnection.on(LiveTranscriptionEvents.Open, () => {
      console.log(`[transcription] Deepgram connection opened for ${participant.name}`);
      
      // Flush any audio chunks we buffered while connecting
      const chunks = this.audioChunkBuffers.get(ws) || [];
      if (chunks.length > 0) {
        console.log(`[transcription] Flushing ${chunks.length} buffered audio chunks`);
        for (const chunk of chunks) {
          dgConnection.send(chunk as any);
        }
        this.audioChunkBuffers.delete(ws);
      }
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0]?.transcript || "";
      let buffer = this.speakerBuffers.get(ws) || "";

      // Ignore completely empty heartbeat packets
      if (!transcript && !data.speech_final) return;

      if (data.is_final) {
        // Words are locked in by Deepgram. Append them to our running sentence.
        if (transcript) {
          buffer = buffer ? `${buffer} ${transcript}` : transcript;
        }

        if (data.speech_final) {
          // The speaker paused. Finalize the full stitched sentence.
          if (buffer.trim()) {
            const finalLine = this.transcriptProcessor.formatFinal(
              participant.id,
              participant.name,
              buffer
            );
            this.meetingManager.addTranscript(meetingId, finalLine);
            this.connectionManager.broadcastToRoom(meetingId, {
              type: WSEvent.TRANSCRIPT_FINAL,
              line: finalLine,
            });
          }
          // Reset buffer for the next sentence
          this.speakerBuffers.set(ws, "");
        } else {
          // Sentence is still ongoing, update the UI with the locked words
          this.speakerBuffers.set(ws, buffer);
          if (buffer.trim()) {
            const interimSeg = this.transcriptProcessor.formatInterim(
              participant.id,
              participant.name,
              buffer
            );
            this.connectionManager.broadcastToRoom(meetingId, {
              type: WSEvent.TRANSCRIPT_INTERIM,
              segment: interimSeg,
            });
          }
        }
      } else {
        // Interim guess for the current words. Stitch it with our locked words for the UI.
        const currentGuess = buffer ? `${buffer} ${transcript}` : transcript;
        if (currentGuess.trim()) {
          const interimSeg = this.transcriptProcessor.formatInterim(
            participant.id,
            participant.name,
            currentGuess
          );
          this.connectionManager.broadcastToRoom(meetingId, {
            type: WSEvent.TRANSCRIPT_INTERIM,
            segment: interimSeg,
          });
        }
      }
    });

    dgConnection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      const buffer = this.speakerBuffers.get(ws) || "";
      if (buffer.trim()) {
        const finalLine = this.transcriptProcessor.formatFinal(
          participant.id,
          participant.name,
          buffer
        );
        this.meetingManager.addTranscript(meetingId, finalLine);
        this.connectionManager.broadcastToRoom(meetingId, {
          type: WSEvent.TRANSCRIPT_FINAL,
          line: finalLine,
        });
        this.speakerBuffers.set(ws, "");
      }
    });

    dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error(`[transcription] Deepgram error for ${participant.name}:`, err);
    });

    dgConnection.on(LiveTranscriptionEvents.Close, () => {
      console.log(`[transcription] Deepgram connection closed for ${participant.name}`);
    });
  }

  private startMockTranscriptLoop(ws: WebSocket, meetingId: string, participant: Participant) {
    const phrases = [
      "Hello, testing the Deepgram real-time API.",
      "Deepgram uses ultra-low latency WebSockets.",
      "The voice input is streamed as PCM audio chunks.",
      "This provides a fully managed real-time transcription out of the box.",
      "You can configure your DEEPGRAM_API_KEY in the backend .env file.",
    ];
    let phraseIndex = 0;

    const interval = setInterval(() => {
      const sentence = phrases[phraseIndex % phrases.length]!;
      phraseIndex++;
      const words = sentence.split(" ");
      let stepIdx = 1;

      const stepTimer = setInterval(() => {
        if (stepIdx <= words.length) {
          const interimText = words.slice(0, stepIdx).join(" ");
          this.connectionManager.broadcastToRoom(meetingId, {
            type: WSEvent.TRANSCRIPT_INTERIM,
            segment: this.transcriptProcessor.formatInterim(participant.id, participant.name, interimText),
          });
          stepIdx++;
        } else {
          clearInterval(stepTimer);
          const finalLine = this.transcriptProcessor.formatFinal(participant.id, participant.name, sentence, 0.95);
          this.meetingManager.addTranscript(meetingId, finalLine);
          this.connectionManager.broadcastToRoom(meetingId, {
            type: WSEvent.TRANSCRIPT_FINAL,
            line: finalLine,
          });
        }
      }, 200);
    }, 4500);

    this.mockIntervals.set(ws, interval);
  }

  private stopTranscription(ws: WebSocket) {
    const dgClient = this.deepgramClients.get(ws);
    if (dgClient) {
      dgClient.finish();
      this.deepgramClients.delete(ws);
      this.speakerBuffers.delete(ws);
      this.audioChunkBuffers.delete(ws);
    }

    const mockInterval = this.mockIntervals.get(ws);
    if (mockInterval) {
      clearInterval(mockInterval);
      this.mockIntervals.delete(ws);
    }
  }

  private handleCleanup(ws: WebSocket) {
    this.stopTranscription(ws);

    const info = this.activeParticipants.get(ws);
    if (!info) return;

    const { meetingId, participant } = info;
    console.log(`[socket] Cleaning up connection for ${participant.name}`);

    // Leave connection room
    this.connectionManager.leaveRoom(ws);
    this.activeParticipants.delete(ws);

    // Update meeting roster
    const roster = this.meetingManager.removeParticipant(meetingId, participant.id);
    
    // Broadcast updated participant roster
    this.connectionManager.broadcastToRoom(meetingId, {
      type: WSEvent.PARTICIPANTS,
      participants: roster,
    });
  }
}
