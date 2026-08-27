import { generateSlugId } from "../utils/id.js";
export class MeetingService {
    meetings = new Map();
    createMeeting(input) {
        const id = generateSlugId();
        const meeting = {
            id,
            name: input.name.trim() || "Untitled conversation",
            createdAt: Date.now(),
            hostId: `host_${Math.random().toString(36).slice(2, 9)}`,
            status: "waiting",
        };
        this.meetings.set(id, meeting);
        return meeting;
    }
    getMeeting(id) {
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
    updateMeetingStatus(id, status) {
        const meeting = this.getMeeting(id);
        if (!meeting)
            return null;
        meeting.status = status;
        this.meetings.set(id, meeting);
        return meeting;
    }
}
