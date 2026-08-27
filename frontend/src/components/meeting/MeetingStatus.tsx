import { memo } from "react";
import { cn } from "@/lib/utils";
import type { MeetingStatus as MeetingStatusType } from "@/types/meeting";

const STATUS_CONFIG: Record<
  MeetingStatusType,
  { label: string; dot: string; badge: string }
> = {
  live: {
    label: "LIVE",
    dot: "bg-live animate-pulse-live",
    badge: "bg-live/15 text-live border border-live/30",
  },
  waiting: {
    label: "WAITING",
    dot: "bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground border border-border",
  },
  ended: {
    label: "ENDED",
    dot: "bg-muted-foreground/30",
    badge: "bg-muted text-muted-foreground border border-border",
  },
};

export const MeetingStatus = memo(function MeetingStatus({
  status,
  className,
}: {
  status: MeetingStatusType;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest",
        cfg.badge,
        className,
      )}
      aria-label={`Session status: ${cfg.label}`}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot)} aria-hidden />
      {cfg.label}
    </span>
  );
});
