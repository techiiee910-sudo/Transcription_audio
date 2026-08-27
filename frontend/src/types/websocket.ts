import type { Meeting, MeetingStatus, Participant } from "./meeting";
import type { InterimSegment, TranscriptLine } from "./transcript";

export const WSEvent = {
  JOIN: "JOIN",
  LEAVE: "LEAVE",
  MEETING_STATE: "MEETING_STATE",
  PARTICIPANTS: "PARTICIPANTS",
  STATUS_CHANGED: "STATUS_CHANGED",
  AUDIO_CHUNK: "AUDIO_CHUNK",
  TRANSCRIPT_INTERIM: "TRANSCRIPT_INTERIM",
  TRANSCRIPT_FINAL: "TRANSCRIPT_FINAL",
  TRANSCRIPT_HISTORY: "TRANSCRIPT_HISTORY",
  TRANSCRIPT_CLEAR: "TRANSCRIPT_CLEAR",
  ERROR: "ERROR",
} as const;

export type WSEventType = (typeof WSEvent)[keyof typeof WSEvent];

export type ClientMessage =
  | { type: typeof WSEvent.JOIN; meetingId: string; participant: Participant }
  | { type: typeof WSEvent.LEAVE; meetingId: string; participantId: string }
  | { type: typeof WSEvent.STATUS_CHANGED; meetingId: string; status: MeetingStatus }
  | { type: typeof WSEvent.AUDIO_CHUNK; meetingId: string; chunk: ArrayBuffer; sampleRate: number }
  | { type: typeof WSEvent.TRANSCRIPT_INTERIM; meetingId: string; segment: InterimSegment }
  | { type: typeof WSEvent.TRANSCRIPT_FINAL; meetingId: string; line: TranscriptLine }
  | { type: typeof WSEvent.TRANSCRIPT_CLEAR; meetingId: string };

/** Messages the backend sends to the client. */
export type ServerMessage =
  | { type: typeof WSEvent.MEETING_STATE; meeting: Meeting }
  | { type: typeof WSEvent.PARTICIPANTS; participants: Participant[] }
  | { type: typeof WSEvent.STATUS_CHANGED; status: MeetingStatus }
  | { type: typeof WSEvent.TRANSCRIPT_INTERIM; segment: InterimSegment }
  | { type: typeof WSEvent.TRANSCRIPT_FINAL; line: TranscriptLine }
  | { type: typeof WSEvent.TRANSCRIPT_HISTORY; lines: TranscriptLine[] }
  | { type: typeof WSEvent.TRANSCRIPT_CLEAR }
  | { type: typeof WSEvent.ERROR; message: string };

export type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";
