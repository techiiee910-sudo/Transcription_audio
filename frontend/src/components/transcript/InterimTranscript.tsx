import { memo } from "react";
import { useInterimSegments } from "@/hooks/useTranscript";
import { SpeakerLabel } from "./SpeakerLabel";
import { useMeetingStore } from "@/store/meetingStore";

/** Isolated high-frequency region — the only part that rerenders per keystroke of audio. */
export const InterimTranscript = memo(function InterimTranscript() {
  const segments = useInterimSegments();
  const isCapturing = useMeetingStore((s) => s.isCapturing);
  const me = useMeetingStore((s) => s.me);

  // If there are no interim segments yet, provide instant visual feedback to remove perceived delay
  if (segments.length === 0) {
    return (
      <div className="space-y-3 pt-5" aria-live="polite" aria-atomic="false">
        <article>
          {isCapturing && me && (
            <SpeakerLabel
              speakerId={me.id}
              name={me.name}
              className="mb-1.5 opacity-70"
            />
          )}
          <p className="pl-8 text-[16px] leading-[1.65] text-muted-foreground/60 md:text-[17px] md:leading-[1.7]">
            <span className="animate-pulse flex items-center gap-2">
              <span className="animate-caret inline-block h-[18px] w-[2px] bg-live rounded-full" />
              <span>Listening...</span>
            </span>
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-5" aria-live="polite" aria-atomic="false">
      {segments.map((segment) => (
        <article key={segment.speakerId}>
          <SpeakerLabel
            speakerId={segment.speakerId}
            name={segment.speakerName}
            className="mb-1.5 opacity-70"
          />
          <p className="pl-8 text-[16px] leading-[1.65] font-medium text-foreground/70 md:text-[17px] md:leading-[1.7] selection:bg-live/20">
            {segment.text}
            <span className="animate-caret ml-1 inline-block h-[18px] w-[2px] translate-y-[3px] bg-live rounded-full" />
          </p>
        </article>
      ))}
    </div>
  );
});
