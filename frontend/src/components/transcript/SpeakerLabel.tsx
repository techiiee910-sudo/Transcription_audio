import { memo } from "react";
import { cn } from "@/lib/utils";

const TONES = [
  "bg-signal/15 text-signal-foreground",
  "bg-primary/10 text-primary",
  "bg-live/10 text-live",
  "bg-chart-4/20 text-foreground",
];

export function speakerTone(speakerId: string) {
  let hash = 0;
  for (let i = 0; i < speakerId.length; i++) hash = (hash * 31 + speakerId.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length]!;
}

export function initials(name: string) {
  return name
    .replace(/\(you\)/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface Props {
  speakerId: string;
  name: string;
  timestamp?: number;
  className?: string;
}

export const SpeakerLabel = memo(function SpeakerLabel({
  speakerId,
  name,
  timestamp,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg text-[11px] font-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all",
          speakerTone(speakerId),
        )}
        aria-hidden
      >
        {initials(name)}
      </span>
      <span className="font-display text-[14px] font-bold tracking-tight text-foreground/90">{name}</span>
      {timestamp ? (
        <time
          className="font-mono text-[11px] font-medium text-muted-foreground/60 tabular-nums ml-1"
          dateTime={new Date(timestamp).toISOString()}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      ) : null}
    </div>
  );
});
