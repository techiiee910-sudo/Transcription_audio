import { useMemo } from "react";
import { useMeetingStore } from "@/store/meetingStore";

/** Narrow subscriptions so interim churn never rerenders finalized lines. */
export function useTranscriptLineIds() {
  return useMeetingStore((s) => s.lineIds);
}

export function useTranscriptLine(id: string) {
  return useMeetingStore((s) => s.lines[id]);
}

export function useInterimSegments() {
  const interim = useMeetingStore((s) => s.interim);
  return useMemo(() => Object.values(interim), [interim]);
}

export function useTranscriptCount() {
  return useMeetingStore((s) => s.lineIds.length);
}

/** Speaker of the previous finalized line — used to collapse repeat labels. */
export function usePreviousSpeaker(index: number) {
  return useMeetingStore((s) => {
    const prevId = s.lineIds[index - 1];
    return prevId ? s.lines[prevId]?.speakerId : undefined;
  });
}
