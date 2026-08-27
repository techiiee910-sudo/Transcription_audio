import { InterimSegment, TranscriptLine } from "../types/websocket.js";

export class TranscriptProcessor {
  formatInterim(speakerId: string, name: string, text: string): InterimSegment {
    return {
      speakerId,
      speakerName: name,
      text: text.trim(),
      timestamp: Date.now(),
    };
  }

  formatFinal(speakerId: string, name: string, text: string, confidence?: number): TranscriptLine {
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
