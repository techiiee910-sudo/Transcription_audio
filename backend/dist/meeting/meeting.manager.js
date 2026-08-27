export class MeetingManager {
    meetingService;
    sessions = new Map();
    constructor(meetingService) {
        this.meetingService = meetingService;
    }
    getOrCreateSession(meetingId) {
        let session = this.sessions.get(meetingId);
        if (!session) {
            const meeting = this.meetingService.getMeeting(meetingId);
            session = {
                meeting,
                participants: new Map(),
                transcripts: [],
            };
            this.sessions.set(meetingId, session);
        }
        return session;
    }
    addParticipant(meetingId, participant) {
        const session = this.getOrCreateSession(meetingId);
        session.participants.set(participant.id, participant);
        return Array.from(session.participants.values());
    }
    removeParticipant(meetingId, participantId) {
        const session = this.sessions.get(meetingId);
        if (!session)
            return [];
        session.participants.delete(participantId);
        if (session.participants.size === 0) {
            // Cleanup empty session
            this.sessions.delete(meetingId);
            return [];
        }
        return Array.from(session.participants.values());
    }
    getParticipants(meetingId) {
        const session = this.sessions.get(meetingId);
        if (!session)
            return [];
        return Array.from(session.participants.values());
    }
    addTranscript(meetingId, line) {
        const session = this.getOrCreateSession(meetingId);
        session.transcripts.push(line);
    }
    getTranscripts(meetingId) {
        const session = this.sessions.get(meetingId);
        return session?.transcripts || [];
    }
    clearTranscripts(meetingId) {
        const session = this.sessions.get(meetingId);
        if (session) {
            session.transcripts = [];
        }
    }
}
