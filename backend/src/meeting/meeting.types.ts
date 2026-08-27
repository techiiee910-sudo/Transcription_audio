import { Meeting, Participant, TranscriptLine } from "../types/websocket.js";

export interface CreateMeetingInput {
  name: string;
  hostName: string;
}

export interface ActiveSession {
  meeting: Meeting;
  participants: Map<string, Participant>;
  transcripts: TranscriptLine[];
}
