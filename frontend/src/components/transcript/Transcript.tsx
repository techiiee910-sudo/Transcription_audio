import { useRef } from "react";
import { AudioLines } from "lucide-react";
import { useTranscriptLineIds } from "@/hooks/useTranscript";
import { InterimTranscript } from "./InterimTranscript";
import { TranscriptLineItem } from "./TranscriptLine";

export function Transcript({ status }: { status: string }) {
  const lineIds = useTranscriptLineIds();
  const scrollRef = useRef<HTMLDivElement>(null);

  const empty = lineIds.length === 0;

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="scroll-fade h-full overflow-y-auto px-5 py-6 md:px-8"
      >
      {empty ? (
        <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <AudioLines className="size-8 text-muted-foreground/40" />
          <p className="max-w-xs text-sm text-muted-foreground">
            {status === "live"
              ? "Listening — transcript will appear as people speak."
              : "The transcript appears here once the host starts the conversation."}
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          {lineIds.map((id, index) => (
            <TranscriptLineItem key={id} id={id} index={index} />
          ))}
          <InterimTranscript />
        </div>
      )}
      {empty ? (
        <div className="mx-auto max-w-3xl">
          <InterimTranscript />
        </div>
      ) : null}
      </div>

    </div>
  );
}
