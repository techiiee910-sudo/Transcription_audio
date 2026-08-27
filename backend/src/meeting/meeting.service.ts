import { Meeting, MeetingStatus } from "../types/websocket.js";
import { generateSlugId } from "../utils/id.js";
import { CreateMeetingInput } from "./meeting.types.js";

export class MeetingService {
  private meetings = new Map<string, Meeting>();

  createMeeting(input: CreateMeetingInput): Meeting {
    const id = generateSlugId();
    const meeting: Meeting = {
      id,
      name: input.name.trim() || "Untitled conversation",
      createdAt: Date.now(),
      hostId: `host_${Math.random().toString(36).slice(2, 9)}`,
      status: "waiting",
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  getMeeting(id: string): Meeting | null {
    // If not found, return a synthesized meeting just like frontend mock
    let existing = this.meetings.get(id);
    if (!existing) {
      existing = {
        id,
        name: id === "main" ? "Live Speech Transcription" : "Live conversation",
        createdAt: Date.now(),
        hostId: "host_remote",
        status: "waiting",
      };
      this.meetings.set(id, existing);
    }
    return existing;
  }

  updateMeetingStatus(id: string, status: MeetingStatus): Meeting | null {
    const meeting = this.getMeeting(id);
    if (!meeting) return null;
    meeting.status = status;
    this.meetings.set(id, meeting);
    return meeting;
  }
}
