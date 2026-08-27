import type { Participant } from "@/types/meeting";
import type { ClientMessage, ConnectionState, ServerMessage } from "@/types/websocket";
import { WSEvent } from "@/types/websocket";

const WS_URL = import.meta.env["VITE_WS_URL"] as string | undefined;

export type MessageHandler = (message: ServerMessage) => void;
export type StateHandler = (state: ConnectionState) => void;

export interface Transport {
  send: (message: ClientMessage) => void;
  close: () => void;
}

interface TransportOptions {
  meetingId: string;
  participant: Participant;
  onMessage: MessageHandler;
  onState: StateHandler;
}

/* ------------------------------------------------------------------ */
/* Real backend transport                                              */
/* ------------------------------------------------------------------ */

function createRealTransport(opts: TransportOptions): Transport {
  const socket = new WebSocket(`${WS_URL}/meetings/${opts.meetingId}`);
  socket.binaryType = "arraybuffer";
  opts.onState("connecting");

  socket.onopen = () => {
    opts.onState("open");
    socket.send(
      JSON.stringify({
        type: WSEvent.JOIN,
        meetingId: opts.meetingId,
        participant: opts.participant,
      }),
    );
  };
  socket.onmessage = (event) => {
    try {
      opts.onMessage(JSON.parse(event.data as string) as ServerMessage);
    } catch {
      /* ignore malformed frames */
    }
  };
  socket.onerror = () => opts.onState("error");
  socket.onclose = () => opts.onState("closed");

  return {
    send(message) {
      if (socket.readyState !== WebSocket.OPEN) return;
      if (message.type === WSEvent.AUDIO_CHUNK) {
        socket.send(message.chunk);
        return;
      }
      socket.send(JSON.stringify(message));
    },
    close() {
      socket.close();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Mock transport — cross-tab room sync + simulated transcripts        */
/* ------------------------------------------------------------------ */

const MOCK_SCRIPT = [
  "Alright, we're recording now — everyone should see this text appear live.",
  "The transcript streams in word by word, then locks in once it's final.",
  "Interim results show up lighter so you can tell them apart at a glance.",
  "Anyone on the shared link sees exactly the same conversation feed.",
  "Speaker labels group consecutive lines from the same person together.",
  "When we stop the microphone the session just pauses, nothing is lost.",
];

function createMockTransport(opts: TransportOptions): Transport {
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(`stt:${opts.meetingId}`)
      : null;

  let participants: Participant[] = [opts.participant];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scriptIndex = 0;
  let closed = false;

  const emit = (message: ServerMessage) => opts.onMessage(message);
  const broadcast = (message: ServerMessage) => {
    channel?.postMessage(message);
    emit(message);
  };

  channel &&
    (channel.onmessage = (event: MessageEvent<ServerMessage | { type: "PRESENCE"; participant: Participant }>) => {
      const data = event.data;
      if ((data as { type: string }).type === "PRESENCE") {
        const p = (data as { participant: Participant }).participant;
        if (!participants.some((x) => x.id === p.id)) {
          participants = [...participants, p];
          channel.postMessage({ type: WSEvent.PARTICIPANTS, participants });
          emit({ type: WSEvent.PARTICIPANTS, participants });
        }
        return;
      }
      const msg = data as ServerMessage;
      if (msg.type === WSEvent.PARTICIPANTS) {
        participants = msg.participants.some((p) => p.id === opts.participant.id)
          ? msg.participants
          : [...msg.participants, opts.participant];
      }
      emit(msg);
    });

  setTimeout(() => {
    if (closed) return;
    opts.onState("open");
    emit({ type: WSEvent.PARTICIPANTS, participants });
    channel?.postMessage({ type: "PRESENCE", participant: opts.participant });
  }, 350);

  const streamNext = () => {
    if (closed) return;
    const sentence = MOCK_SCRIPT[scriptIndex % MOCK_SCRIPT.length]!;
    scriptIndex += 1;
    const words = sentence.split(" ");
    let i = 0;

    const step = () => {
      if (closed) return;
      i += 1;
      if (i <= words.length) {
        broadcast({
          type: WSEvent.TRANSCRIPT_INTERIM,
          segment: {
            speakerId: opts.participant.id,
            speakerName: opts.participant.name,
            text: words.slice(0, i).join(" "),
            timestamp: Date.now(),
          },
        });
        timer = setTimeout(step, 90 + Math.random() * 110);
        return;
      }
      broadcast({
        type: WSEvent.TRANSCRIPT_FINAL,
        line: {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          speakerId: opts.participant.id,
          speakerName: opts.participant.name,
          text: sentence,
          timestamp: Date.now(),
          confidence: 0.93 + Math.random() * 0.06,
        },
      });
      timer = setTimeout(streamNext, 900);
    };
    step();
  };

  return {
    send(message) {
      if (message.type === WSEvent.STATUS_CHANGED) {
        broadcast({ type: WSEvent.STATUS_CHANGED, status: message.status });
        if (message.status === "live" && !timer) streamNext();
        if (message.status !== "live" && timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      if (message.type === WSEvent.LEAVE) {
        participants = participants.filter((p) => p.id !== message.participantId);
        channel?.postMessage({ type: WSEvent.PARTICIPANTS, participants });
      }
      /* AUDIO_CHUNK frames are dropped by the mock backend. */
    },
    close() {
      closed = true;
      if (timer) clearTimeout(timer);
      channel?.close();
      opts.onState("closed");
    },
  };
}

export function createMeetingTransport(opts: TransportOptions): Transport {
  return WS_URL ? createRealTransport(opts) : createMockTransport(opts);
}

export const isMockBackend = !WS_URL;
