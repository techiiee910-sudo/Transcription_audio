import { memo, useState, useCallback } from "react";
import { Mic, MicOff, Square, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Loading";

interface MicControlsProps {
  isHost: boolean;
  isCapturing: boolean;
  status: string;
  level: number;
  micError: string | null;
  connection: string;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

/**
 * Bottom control bar with mic start / stop button and level meter.
 * Only the host can start/stop; guests see a read-only listener indicator.
 */
export const MicControls = memo(function MicControls({
  isHost,
  isCapturing,
  status,
  level,
  micError,
  connection,
  onStart,
  onStop,
  onClear,
}: MicControlsProps) {
  const isConnecting = connection === "connecting" || connection === "idle";
  const canInteract = !isConnecting && status !== "ended";

  const [justCleared, setJustCleared] = useState(false);

  const handleClear = useCallback(() => {
    onClear();
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 1500);
  }, [onClear]);

  // Level bar segments (8 bars)
  const segments = 8;
  const filledBars = Math.round(level * segments);

  if (!isHost) {
    return (
      <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mic className="size-3.5" aria-hidden />
          Listening as participant
        </span>
      </footer>
    );
  }

  return (
    <footer
      className="flex shrink-0 flex-col items-center gap-2 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm"
      aria-label="Microphone controls"
    >
      {micError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-1.5 text-center text-xs text-destructive"
        >
          {micError}
        </p>
      )}

      <div className="flex w-full flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Dynamic Voice Visualizer */}
        <div
          className="hidden sm:flex h-8 items-center gap-1.5"
          aria-label={`Microphone level: ${Math.round(level * 100)}%`}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(level * 100)}
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
                  isActive ? "bg-signal" : "bg-border",
                )}
              />
            );
          })}
        </div>

        {/* Main action buttons */}
        <div className="flex w-full sm:w-auto items-center gap-2">
          <button
            id="mic-toggle-btn"
            onClick={isCapturing ? onStop : onStart}
            disabled={!canInteract}
            aria-label={isCapturing ? "Stop recording" : "Start conversation"}
            className={cn(
              "flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50",
              "disabled:pointer-events-none disabled:opacity-50",
              isCapturing
                ? "bg-live/15 text-live hover:bg-live/25 border border-live/30"
                : "bg-signal text-white hover:bg-signal/90 shadow-sm",
              "active:scale-[0.97]",
            )}
          >
            {isConnecting ? (
              <Spinner className="size-4" />
            ) : isCapturing ? (
              <Square className="size-4 fill-current" aria-hidden />
            ) : (
              <Mic className="size-4" aria-hidden />
            )}
            {isConnecting
              ? "Connecting…"
              : isCapturing
                ? "Stop"
                : status === "waiting"
                  ? "Start"
                  : "Resume"}
          </button>
          
          <button
            onClick={handleClear}
            disabled={justCleared}
            aria-label="Start new conversation"
            className={cn(
              "flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border shadow-sm active:scale-[0.97]",
              justCleared 
                ? "bg-green-500/15 text-green-600 hover:bg-green-500/20 border border-green-500/30"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            {justCleared ? (
              <>
                <Check className="size-4 animate-in zoom-in duration-200" aria-hidden />
                Cleared
              </>
            ) : (
              <>
                <RotateCcw className="size-4" aria-hidden />
                New
              </>
            )}
          </button>
        </div>

        {/* Muted indicator (spacer on right) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground w-[80px] justify-end">
          {isCapturing ? (
            <>
              <span className="animate-pulse-live inline-block size-1.5 rounded-full bg-live" />
              Recording
            </>
          ) : (
            <>
              <MicOff className="size-3.5" aria-hidden />
              Paused
            </>
          )}
        </div>
      </div>
    </footer>
  );
});
