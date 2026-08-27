import { Users } from "lucide-react";
import type { Participant } from "@/types/meeting";
import { ParticipantItem } from "./Participant";

export function ParticipantList({
  participants,
  speakingIds = [],
}: {
  participants: Participant[];
  speakingIds?: string[];
}) {
  return (
    <section aria-label="Participants" className="p-4">
      <header className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Users className="size-4" />
        <h2 className="text-xs font-semibold tracking-wider uppercase">
          Participants
          <span className="ml-1.5 font-mono text-[11px] normal-case">{participants.length}</span>
        </h2>
      </header>
      <ul className="space-y-0.5">
        {participants.map((p) => (
          <ParticipantItem key={p.id} participant={p} speaking={speakingIds.includes(p.id)} />
        ))}
        {participants.length === 0 ? (
          <li className="px-2 py-1.5 text-sm text-muted-foreground">Just you so far.</li>
        ) : null}
      </ul>
    </section>
  );
}
