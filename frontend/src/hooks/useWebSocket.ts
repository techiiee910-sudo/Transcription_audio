import { useCallback, useEffect, useRef } from "react";
import { createMeetingTransport, type Transport } from "@/lib/websocket";
import { useMeetingStore } from "@/store/meetingStore";
import type { Participant } from "@/types/meeting";
import type { ClientMessage } from "@/types/websocket";
import { WSEvent } from "@/types/websocket";

/** Owns the socket lifecycle and funnels server events into the store. */
export function useWebSocket(meetingId: string | null, participant: Participant | null) {
  const transportRef = useRef<Transport | null>(null);

  useEffect(() => {
    if (!meetingId || !participant) return;
    const store = useMeetingStore.getState();
    store.setConnection("connecting");

    const transport = createMeetingTransport({
      meetingId,
      participant,
      onState: (state) => useMeetingStore.getState().setConnection(state),
      onMessage: (message) => {
        const s = useMeetingStore.getState();
        switch (message.type) {
          case WSEvent.MEETING_STATE:
            s.setMeeting(message.meeting);
            break;
          case WSEvent.PARTICIPANTS:
            s.setParticipants(message.participants);
            break;
          case WSEvent.STATUS_CHANGED:
            s.setStatus(message.status);
            break;
          case WSEvent.TRANSCRIPT_INTERIM:
            s.setInterim(message.segment);
            break;
          case WSEvent.TRANSCRIPT_FINAL:
            s.addFinal(message.line);
            break;
          case WSEvent.TRANSCRIPT_HISTORY:
            s.setTranscriptHistory(message.lines);
            break;
          case WSEvent.TRANSCRIPT_CLEAR:
            s.clearTranscript();
            break;
          case WSEvent.ERROR:
            console.error("[ws]", message.message);
            break;
        }
      },
    });

    transportRef.current = transport;
    return () => {
      transport.send({ type: WSEvent.LEAVE, meetingId, participantId: participant.id });
      transport.close();
      transportRef.current = null;
    };
  }, [meetingId, participant]);

  const send = useCallback((message: ClientMessage) => {
    transportRef.current?.send(message);
  }, []);

  return { send };
}
