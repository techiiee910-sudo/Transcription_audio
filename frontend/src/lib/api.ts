import type { CreateMeetingInput, Meeting } from "@/types/meeting";

const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;

const STORAGE_PREFIX = "stt:meeting:";

function slugId() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

/** Mock persistence layer — replaced transparently once VITE_API_URL is set. */
const mockStore = {
  save(meeting: Meeting) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_PREFIX + meeting.id, JSON.stringify(meeting));
  },
  load(id: string): Meeting | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    return raw ? (JSON.parse(raw) as Meeting) : null;
  },
};

export const api = {
  async createMeeting(input: CreateMeetingInput): Promise<Meeting> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return (await res.json()) as Meeting;
    }

    const meeting: Meeting = {
      id: slugId(),
      name: input.name.trim() || "Untitled conversation",
      createdAt: Date.now(),
      hostId: `host_${Math.random().toString(36).slice(2, 9)}`,
      status: "waiting",
    };
    mockStore.save(meeting);
    return meeting;
  },

  async getMeeting(id: string): Promise<Meeting | null> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/meetings/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to load conversation");
      return (await res.json()) as Meeting;
    }

    const existing = mockStore.load(id);
    if (existing) return existing;

    // Someone opened a shared link on another device: synthesize a joinable room.
    const meeting: Meeting = {
      id,
      name: id === "main" ? "Live Speech Transcription" : "Live conversation",
      createdAt: Date.now(),
      hostId: "host_remote",
      status: "waiting",
    };
    mockStore.save(meeting);
    return meeting;
  },
};

export function meetingLink(id: string) {
  if (typeof window === "undefined") return `/live/${id}`;
  return `${window.location.origin}/live/${id}`;
}
