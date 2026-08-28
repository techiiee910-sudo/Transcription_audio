import { useEffect, useRef } from "react";
import { useTranscriptLineIds } from "@/hooks/useTranscript";
import { InterimTranscript } from "./InterimTranscript";
import { TranscriptLineItem } from "./TranscriptLine";

export function Transcript() {
  const lineIds = useTranscriptLineIds();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      // Auto-scroll to the bottom when new transcript content arrives
      // We check if we are near the bottom to avoid fighting the user if they scroll up
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      if (isNearBottom) {
        container.scrollTo({ top: scrollHeight, behavior: "smooth" });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
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
