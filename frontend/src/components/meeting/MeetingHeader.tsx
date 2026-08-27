import { AudioLines } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Meeting, MeetingStatus } from "@/types/meeting";
import { MeetingStatus as MeetingStatusBadge } from "./MeetingStatus";
import { ShareButton } from "./ShareButton";
import { cn } from "@/lib/utils";

interface MeetingHeaderProps {
  meeting: Meeting | null;
  status: MeetingStatus;
  isHost: boolean;
  level: number;
  isCapturing: boolean;
}

export function MeetingHeader({ meeting, status, isHost, level, isCapturing }: MeetingHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:px-6">
      {/* Logo / Home link */}
      <Link
        to="/"
        aria-label="LiveSpeak home"
        className="mr-1 flex items-center gap-2 text-foreground transition-opacity hover:opacity-70"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-signal text-white">
          <AudioLines className="size-4" aria-hidden />
        </span>
        <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
          LiveSpeak
        </span>
      </Link>

      {/* Divider */}
      <div className="h-5 w-px bg-border" aria-hidden />

      {/* Meeting name (Desktop) / Visualizer (Mobile) */}
      <div className="min-w-0 flex-1">
        {/* Desktop Title */}
        <h1
          className="hidden md:block truncate font-display text-sm font-semibold text-foreground md:text-base"
          title={meeting?.name ?? "Loading…"}
        >
          {meeting?.name ?? "Loading conversation…"}
        </h1>
        {/* Mobile Visualizer */}
        <div
          className="md:hidden flex h-8 items-center gap-1.5"
          aria-label={`Microphone level`}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const multipliers = [0.4, 0.8, 1, 0.8, 0.4];
            const multiplier = multipliers[i] ?? 1;
            const isActive = isCapturing && level > 0.01;
            
            const jitter = isActive ? Math.random() * 0.2 : 0;
            const normalizedLevel = isActive ? Math.max(0.2, level * 1.8) : 0;
            
            const height = isActive
              ? Math.max(15, Math.min(100, (normalizedLevel + jitter) * multiplier * 100))
              : 15;

            return (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={cn(
                  "w-2 rounded-full",
                  isActive ? "bg-signal" : "bg-border/50",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Status pill */}
      <MeetingStatusBadge status={status} />

      {/* Share button */}
      {meeting && isHost && (
        <ShareButton meetingId={meeting.id} className="hidden sm:inline-flex" />
      )}
    </header>
  );
}
