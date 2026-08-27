import { Meeting, Participant } from "../types/websocket.js";
import { ActiveSession } from "./meeting.types.js";
import { MeetingService } from "./meeting.service.js";

export class MeetingManager {
  private sessions = new Map<string, ActiveSession>();

  constructor(private meetingService: MeetingService) {}

  getOrCreateSession(meetingId: string): ActiveSession {
    let session = this.sessions.get(meetingId);
    if (!session) {
      const meeting = this.meetingService.getMeeting(meetingId) as Meeting;
      session = {
        meeting,
        participants: new Map<string, Participant>(),
        transcripts: [],
      };
      this.sessions.set(meetingId, session);
    }
    return session;
  }

  addParticipant(meetingId: string, participant: Participant): Participant[] {
    const session = this.getOrCreateSession(meetingId);
    session.participants.set(participant.id, participant);
    return Array.from(session.participants.values());
  }

  removeParticipant(meetingId: string, participantId: string): Participant[] {
    const session = this.sessions.get(meetingId);
    if (!session) return [];
    session.participants.delete(participantId);
    if (session.participants.size === 0) {
      // Cleanup empty session
      this.sessions.delete(meetingId);
      return [];
    }
    return Array.from(session.participants.values());
  }

  getParticipants(meetingId: string): Participant[] {
    const session = this.sessions.get(meetingId);
    if (!session) return [];
    return Array.from(session.participants.values());
  }

  addTranscript(meetingId: string, line: import("../types/websocket.js").TranscriptLine) {
    const session = this.getOrCreateSession(meetingId);
    session.transcripts.push(line);
  }

  getTranscripts(meetingId: string): import("../types/websocket.js").TranscriptLine[] {
    const session = this.sessions.get(meetingId);
    return session?.transcripts || [];
  }

  clearTranscripts(meetingId: string) {
    const session = this.sessions.get(meetingId);
    if (session) {
      session.transcripts = [];
    }
  }
}
