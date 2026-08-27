export interface Speaker {
  id: string;
  name: string;
}

/** A finalized transcript line. */
export interface TranscriptLine {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: number;
  confidence?: number;
}

/** An in-flight, not-yet-final transcript fragment (one per speaker). */
export interface InterimSegment {
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: number;
}
