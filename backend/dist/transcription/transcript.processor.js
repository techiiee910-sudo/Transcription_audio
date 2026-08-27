export class TranscriptProcessor {
    formatInterim(speakerId, name, text) {
        return {
            speakerId,
            speakerName: name,
            text: text.trim(),
            timestamp: Date.now(),
        };
    }
    formatFinal(speakerId, name, text, confidence) {
        return {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            speakerId,
            speakerName: name,
            text: text.trim(),
            timestamp: Date.now(),
            confidence,
        };
    }
}
