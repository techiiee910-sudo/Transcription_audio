import { useCallback, useEffect, useRef, useState } from "react";
import { AudioCapture } from "@/lib/audio";

interface Options {
  onChunk: (chunk: ArrayBuffer, sampleRate: number) => void;
}

/** Microphone lifecycle only — never touches transcript state. */
export function useAudioCapture({ onChunk }: Options) {
  const captureRef = useRef<AudioCapture | null>(null);
  const chunkRef = useRef(onChunk);
  chunkRef.current = onChunk;

  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const start = useCallback(async () => {
    if (captureRef.current) return true;
    setError(null);
    const capture = new AudioCapture({
      onChunk: (chunk, rate) => chunkRef.current(chunk, rate),
      onLevel: setLevel,
      onError: (e) => setError(e.message),
    });
    try {
      await capture.start();
      captureRef.current = capture;
      setActive(true);
      return true;
    } catch {
      setError("Microphone access was blocked. Transcription will run without local audio.");
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    captureRef.current?.stop();
    captureRef.current = null;
    setActive(false);
    setLevel(0);
  }, []);

  useEffect(() => () => captureRef.current?.stop(), []);

  return { start, stop, level, error, active };
}
