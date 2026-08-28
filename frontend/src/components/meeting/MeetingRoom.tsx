import { useMemo } from "react";
import { MeetingHeader } from "./MeetingHeader";
import { MicControls } from "./MicControls";
import { WaitingScreen } from "./WaitingScreen";
import { Transcript } from "@/components/transcript/Transcript";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { Loading } from "@/components/ui/Loading";
import { useMeeting } from "@/hooks/useMeeting";
import { useMeetingStore } from "@/store/meetingStore";

interface MeetingRoomProps {
  meetingId: string;
}

/**
 * Top-level meeting layout. Consumes useMeeting and distributes
 * all state to dumb child components. No business logic here.
 */
export function MeetingRoom({ meetingId }: MeetingRoomProps) {
  const {
    meeting,
    status,
    connection,
    participants,
    loading,
    notFound,
    isHost,
    isCapturing,
    level,
    micError,
    startConversation,
    stopConversation,
    clearConversation,
  } = useMeeting(meetingId);

  // Derive speaking IDs from interim segments (present in store)
  const interim = useMeetingStore((s) => s.interim);
  const interimKeys = useMemo(() => Object.keys(interim), [interim]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Loading label="Loading conversation…" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-2xl font-semibold text-foreground">
          Conversation not found
        </p>
        <p className="text-sm text-muted-foreground">
          This link may be invalid or the conversation may have ended.
        </p>
        <a
          href="/"
          className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to home
        </a>
      </div>
    );
  }

  const showTranscript = status === "live" || status === "ended";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground selection:bg-live/30">
      {/* Subtle ambient glows for premium AI aesthetic */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-signal/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[0%] h-[40%] w-[40%] rounded-full bg-live/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <MeetingHeader 
          meeting={meeting} 
          status={status} 
          isHost={isHost}
          level={level}
          isCapturing={isCapturing} 
        />

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Sidebar — hidden on mobile */}
          <aside className="hidden w-56 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-md lg:flex xl:w-64">
            <ParticipantList
              participants={participants}
              speakingIds={interimKeys}
            />
          </aside>

          {/* Main content area */}
          <main className="flex min-w-0 flex-1 flex-col relative z-0">
            {showTranscript ? (
              <Transcript />
            ) : (
              <WaitingScreen meetingId={meetingId} isHost={isHost} />
            )}
          </main>
        </div>

        {/* Footer controls */}
        <MicControls
          isHost={isHost}
          isCapturing={isCapturing}
          status={status}
          level={level}
          micError={micError}
          connection={connection}
          onStart={startConversation}
          onStop={stopConversation}
          onClear={clearConversation}
        />
      </div>
    </div>
  );
}
