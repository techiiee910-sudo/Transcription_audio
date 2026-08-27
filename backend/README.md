# LiveSpeak Backend (Deepgram Edition)

High-performance real-time speech-to-text transcription backend for LiveSpeak using Deepgram models.

## Technology Stack

- **Node.js** with TypeScript
- **Express** for REST endpoints (`POST /meetings` & `GET /meetings/:id`)
- **ws** for high-frequency WebSocket management (`wss://localhost:4000/meetings/:meetingId`)
- **Deepgram API** for real-time speech-to-text using `nova-2` via live streaming WebSockets.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file and configure variables:
   ```bash
   cp .env.example .env
   ```

3. Fill in your `DEEPGRAM_API_KEY` in `.env`.
   - *If `DEEPGRAM_API_KEY` is not provided, the backend falls back to simulated/mocked transcript loops for local testing automatically.*

4. Launch dev server:
   ```bash
   npm run dev
   ```

## WebSocket Protocol

### Client -> Server Messages
- `JOIN`: Join a room with user metadata.
- `STATUS_CHANGED`: Change session status to `"live"` or `"waiting"`.
- `LEAVE`: Remove user connection cleanly.
- `AUDIO_CHUNK`: ArrayBuffer representation of raw 16kHz PCM audio chunk.

### Server -> Client Messages
- `MEETING_STATE`: Provides room information.
- `PARTICIPANTS`: Sync roster changes.
- `STATUS_CHANGED`: Sync status changes.
- `TRANSCRIPT_INTERIM`: Real-time interim transcript lines.
- `TRANSCRIPT_FINAL`: Fully finalized transcript segments.
