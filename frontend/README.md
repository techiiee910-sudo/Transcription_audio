# LiveSpeak — Real-time Speech-to-Text Frontend

## Environment Variables

Copy this file to `.env.local` and fill in your values.

```bash
cp .env.example .env.local
```

### Variables

```env
# Backend REST API base URL (no trailing slash)
# When unset, the app uses a mock in-memory backend
VITE_API_URL=https://your-backend.example.com

# Backend WebSocket URL (no trailing slash)
# When unset, the app uses a mock BroadcastChannel-based transport
VITE_WS_URL=wss://your-backend.example.com
```

## Running Locally

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000 by default.

## Key Architecture Decisions

- **Zustand store** (`src/store/meetingStore.ts`) holds all transcript and meeting state.
- **WebSocket transport** (`src/lib/websocket.ts`) has two modes:
  - **Mock** (no `VITE_WS_URL`): uses `BroadcastChannel` for cross-tab sync + simulated transcripts.
  - **Real** (with `VITE_WS_URL`): connects to the backend WebSocket.
- **Interim vs final**: interim segments are keyed by `speakerId` and isolated so they never re-render finalized lines.
- **Audio capture** (`src/lib/audio.ts`): PCM at 16 kHz, streamed as `AUDIO_CHUNK` WebSocket frames.

## Routes

| Path | Description |
|---|---|
| `/` | Landing page — hero + create CTA |
| `/create` | Create conversation form |
| `/live/:meetingId` | Live transcription room |

## Connecting to the Real Backend

1. Set `VITE_API_URL` and `VITE_WS_URL` in `.env.local`.
2. Your backend should implement:
   - `POST /meetings` → returns `Meeting`
   - `GET /meetings/:id` → returns `Meeting`
   - `WS /meetings/:id` → sends/receives the events defined in `src/types/websocket.ts`
