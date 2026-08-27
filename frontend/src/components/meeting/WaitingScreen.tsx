import { Clock, Wifi } from "lucide-react";
import { ShareButton } from "./ShareButton";

interface WaitingScreenProps {
  meetingId: string;
  isHost: boolean;
}

/**
 * Full-screen waiting state shown to guests before the host starts.
 * The host sees a prompt to start; guests see "Waiting for host".
 */
export function WaitingScreen({ meetingId, isHost }: WaitingScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      {/* Animated waiting visual */}
      <div className="relative flex size-20 items-center justify-center rounded-2xl bg-muted">
        <Clock className="size-8 text-muted-foreground" aria-hidden />
        {/* Pulsing ring */}
        <span className="absolute inset-0 animate-ping rounded-2xl bg-signal/10" />
      </div>

      <div className="max-w-sm space-y-2">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {isHost ? "Ready when you are" : "Waiting for host"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isHost
            ? "Hit \"Start conversation\" below to begin transcribing. Everyone on this link will see the transcript live."
            : "The host hasn't started yet. You'll see the transcript appear automatically as soon as they begin."}
        </p>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
        <Wifi className="size-3.5" aria-hidden />
        Connected · waiting for audio
      </div>

      {/* Share the link (Animated Box) */}
      {isHost && (
        <div className="group relative mt-6 flex flex-col items-center">
          {/* Animated Glow Behind Card */}
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-signal/40 via-primary/20 to-signal/40 opacity-50 blur-lg transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
          
          {/* Card Content */}
          <div className="relative flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card/80 px-8 py-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-foreground">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
              </span>
              Invite others to listen in
            </div>
            <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              Anyone with the link will see your words transcribed live on their screen.
            </p>
            <div className="mt-2 transition-transform duration-300 hover:scale-105">
              <ShareButton meetingId={meetingId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
