export type MeetingStatus = "waiting" | "live" | "ended";

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isSpeaking?: boolean;
  joinedAt: number;
}

export interface Meeting {
  id: string;
  name: string;
  createdAt: number;
  hostId: string;
  status: MeetingStatus;
}

export interface CreateMeetingInput {
  name: string;
  hostName: string;
}
