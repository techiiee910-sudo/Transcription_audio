import { memo } from "react";
import { cn } from "@/lib/utils";
import { initials, speakerTone } from "@/components/transcript/SpeakerLabel";
import type { Participant as ParticipantType } from "@/types/meeting";

export const ParticipantItem = memo(function ParticipantItem({
  participant,
  speaking,
}: {
  participant: ParticipantType;
  speaking?: boolean;
}) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
      <span
        className={cn(
          "relative flex size-7 items-center justify-center rounded-md text-[11px] font-semibold",
          speakerTone(participant.id),
        )}
      >
        {initials(participant.name)}
        {speaking ? (
          <span className="animate-pulse-live absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-signal ring-2 ring-card" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{participant.name}</span>
      {participant.isHost ? (
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          Host
        </span>
      ) : null}
    </li>
  );
});
