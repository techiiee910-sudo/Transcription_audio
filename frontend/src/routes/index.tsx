import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";
import { markAsHost } from "@/hooks/useMeeting";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiveSpeak — Real-time Conversation Transcription" },
      {
        name: "description",
        content:
          "Real-time live speech-to-text transcription right on your screen.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const meetingId = "main";

  useEffect(() => {
    markAsHost(meetingId);
  }, [meetingId]);

  return <MeetingRoom meetingId={meetingId} />;
}
