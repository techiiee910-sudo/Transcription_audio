import { memo } from "react";
import { useTranscriptLine, usePreviousSpeaker } from "@/hooks/useTranscript";
import { SpeakerLabel } from "./SpeakerLabel";

/**
 * Subscribes to a single line only, so streaming interim updates
 * never rerender already-finalized lines.
 */
export const TranscriptLineItem = memo(function TranscriptLineItem({
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  const line = useTranscriptLine(id);
  const previousSpeaker = usePreviousSpeaker(index);
  if (!line) return null;

  const showLabel = previousSpeaker !== line.speakerId;

  return (
    <article className={showLabel ? "pt-6 first:pt-0" : "pt-2"}>
      {showLabel ? (
        <SpeakerLabel
          speakerId={line.speakerId}
          name={line.speakerName}
          timestamp={line.timestamp}
          className="mb-2"
        />
      ) : null}
      <p className="animate-in fade-in slide-in-from-bottom-1 duration-500 ease-out pl-8 pr-4 text-[16px] leading-[1.65] text-foreground/90 md:text-[17px] md:leading-[1.7] selection:bg-primary/20">
        {line.text}
      </p>
    </article>
  );
});
