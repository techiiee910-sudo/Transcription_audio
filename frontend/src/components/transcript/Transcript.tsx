import { useTranscriptLineIds } from "@/hooks/useTranscript";
import { InterimTranscript } from "./InterimTranscript";
import { TranscriptLineItem } from "./TranscriptLine";

export function Transcript() {
  const lineIds = useTranscriptLineIds();


  return (
    <div className="relative h-full">
      <div
        className="scroll-fade h-full overflow-y-auto px-5 py-6 md:px-8"
      >
        <div className="mx-auto max-w-3xl pb-[60vh]">
          {lineIds.map((id, index) => (
            <TranscriptLineItem key={id} id={id} index={index} />
          ))}
          <InterimTranscript />
        </div>
      </div>
    </div>
  );
}
