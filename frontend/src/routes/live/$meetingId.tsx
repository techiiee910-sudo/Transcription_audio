import { createFileRoute } from "@tanstack/react-router";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";

export const Route = createFileRoute("/live/$meetingId")({
  head: () => ({
    meta: [
      { title: "Live Conversation — LiveSpeak" },
      {
        name: "description",
        content: "Real-time live transcription — watch the conversation unfold.",
      },
    ],
  }),
  component: LiveMeetingPage,
});

function LiveMeetingPage() {
  const { meetingId } = Route.useParams();
  return <MeetingRoom meetingId={meetingId} />;
}
