import { create } from "zustand";
import type { Meeting, MeetingStatus, Participant } from "@/types/meeting";
import type { InterimSegment, TranscriptLine } from "@/types/transcript";
import type { ConnectionState } from "@/types/websocket";

interface MeetingState {
  meeting: Meeting | null;
  me: Participant | null;
  participants: Participant[];
  connection: ConnectionState;
  /** Finalized lines, append-only. Stored normalized so a line update
   *  only rerenders the single subscribed <TranscriptLine />. */
  lineIds: string[];
  lines: Record<string, TranscriptLine>;
  /** Interim segments keyed by speaker id — high-frequency, isolated. */
  interim: Record<string, InterimSegment>;
  isCapturing: boolean;

  setMeeting: (m: Meeting | null) => void;
  setMe: (p: Participant | null) => void;
  setParticipants: (p: Participant[]) => void;
  setStatus: (s: MeetingStatus) => void;
  setConnection: (c: ConnectionState) => void;
  setCapturing: (v: boolean) => void;
  addFinal: (line: TranscriptLine) => void;
  setInterim: (segment: InterimSegment) => void;
  clearInterim: (speakerId: string) => void;
  setTranscriptHistory: (lines: TranscriptLine[]) => void;
  clearTranscript: () => void;
  reset: () => void;
}

const initial = {
  meeting: null,
  me: null,
  participants: [],
  connection: "idle" as ConnectionState,
  lineIds: [],
  lines: {},
  interim: {},
  isCapturing: false,
};

export const useMeetingStore = create<MeetingState>((set) => ({
  ...initial,
  setMeeting: (meeting) => set({ meeting }),
  setMe: (me) => set({ me }),
  setParticipants: (participants) => set({ participants }),
  setStatus: (status) =>
    set((s) => (s.meeting ? { meeting: { ...s.meeting, status } } : {})),
  setConnection: (connection) => set({ connection }),
  setCapturing: (isCapturing) => set({ isCapturing }),
  addFinal: (line) =>
    set((s) => {
      if (s.lines[line.id]) return {};
      const { [line.speakerId]: _drop, ...interim } = s.interim;
      return {
        lineIds: [...s.lineIds, line.id],
        lines: { ...s.lines, [line.id]: line },
        interim,
      };
    }),
  setInterim: (segment) =>
    set((s) => ({ interim: { ...s.interim, [segment.speakerId]: segment } })),
  clearInterim: (speakerId) =>
    set((s) => {
      const { [speakerId]: _drop, ...interim } = s.interim;
      return { interim };
    }),
  setTranscriptHistory: (lines) =>
    set((s) => {
      const newLines = { ...s.lines };
      const newLineIds = [...s.lineIds];
      for (const line of lines) {
        if (!newLines[line.id]) {
          newLines[line.id] = line;
          newLineIds.push(line.id);
        }
      }
      return { lines: newLines, lineIds: newLineIds };
    }),
  clearTranscript: () => set({ lines: {}, lineIds: [] }),
  reset: () => set({ ...initial }),
}));

/** Stable selectors — keep component subscriptions narrow. */
export const selectLineIds = (s: MeetingState) => s.lineIds;
export const selectLine = (id: string) => (s: MeetingState) => s.lines[id];
export const selectInterimKeys = (s: MeetingState) => s.interim;
