import { useRef } from "react";
import { useTranscriptLineIds } from "@/hooks/useTranscript";
import { InterimTranscript } from "./InterimTranscript";
import { TranscriptLineItem } from "./TranscriptLine";

export function Transcript() {
  const lineIds = useTranscriptLineIds();
  const scrollRef = useRef<HTMLDivElement>(null);


  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="scroll-fade h-full overflow-y-auto px-5 py-6 md:px-8"
      >
        <div className="mx-auto max-w-3xl">
          {lineIds.map((id, index) => (
            <TranscriptLineItem key={id} id={id} index={index} />
          ))}
          <InterimTranscript />
        </div>
      </div>

    </div>
  );
}
