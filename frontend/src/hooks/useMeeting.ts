import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useMeetingStore } from "@/store/meetingStore";
import type { Participant } from "@/types/meeting";
import { WSEvent } from "@/types/websocket";
import { useAudioCapture } from "./useAudioCapture";
import { useWebSocket } from "./useWebSocket";

const NAME_KEY = "stt:name";
const HOST_KEY = "stt:host:";

const ADJECTIVES = ["Quick", "Calm", "Bright", "Keen", "Sharp"];
const NOUNS = ["Falcon", "Otter", "Cedar", "Ember", "Harbor"];

function randomName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a} ${n}`;
}

/** Orchestrates loading the meeting, joining the socket and mic control. */
export function useMeeting(meetingId: string) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const meeting = useMeetingStore((s) => s.meeting);
  const status = useMeetingStore((s) => s.meeting?.status ?? "waiting");
  const connection = useMeetingStore((s) => s.connection);
  const participants = useMeetingStore((s) => s.participants);
  const isCapturing = useMeetingStore((s) => s.isCapturing);

  useEffect(() => {
    let cancelled = false;
    const store = useMeetingStore.getState();
    store.reset();
    setLoading(true);

    void api.getMeeting(meetingId).then((found) => {
      if (cancelled) return;
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const isHost = sessionStorage.getItem(HOST_KEY + meetingId) === "1";
      const name = localStorage.getItem(NAME_KEY) ?? randomName();
      localStorage.setItem(NAME_KEY, name);

      const me: Participant = {
        id: `p_${Math.random().toString(36).slice(2, 9)}`,
        name: isHost ? `${name} (you)` : `${name} (you)`,
        isHost,
        joinedAt: Date.now(),
      };
      useMeetingStore.getState().setMeeting(found);
      useMeetingStore.getState().setMe(me);
      setParticipant(me);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const { send } = useWebSocket(participant ? meetingId : null, participant);


  const { start: startMic, stop: stopMic, level, error: micError } = useAudioCapture({
    onChunk: (chunk, sampleRate) =>
      send({ type: WSEvent.AUDIO_CHUNK, meetingId, chunk, sampleRate }),
  });

  const startConversation = useCallback(async () => {
    const success = await startMic();
    if (!success) return;
    
    useMeetingStore.getState().setCapturing(true);
    send({ type: WSEvent.STATUS_CHANGED, meetingId, status: "live" });
  }, [meetingId, send, startMic]);

  const stopConversation = useCallback(() => {
    stopMic();
    useMeetingStore.getState().setCapturing(false);
    send({ type: WSEvent.STATUS_CHANGED, meetingId, status: "waiting" });
  }, [meetingId, send, stopMic]);

  const clearConversation = useCallback(() => {
    useMeetingStore.getState().clearTranscript();
    send({ type: WSEvent.TRANSCRIPT_CLEAR, meetingId });
  }, [meetingId, send]);

  const isHost = participant?.isHost ?? false;

  const roster = useMemo(
    () => [...participants].sort((a, b) => Number(b.isHost) - Number(a.isHost)),
    [participants],
  );

  return {
    meeting,
    status,
    connection,
    participants: roster,
    loading,
    notFound,
    isHost,
    isCapturing,
    level,
    micError,
    startConversation,
    stopConversation,
    clearConversation,
  };
}

export function markAsHost(meetingId: string) {
  sessionStorage.setItem(HOST_KEY + meetingId, "1");
}

/** Persist a human name so it appears in the live room's speaker labels. */
export function setHostName(name: string) {
  if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
}
