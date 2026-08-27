import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AudioLines, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { markAsHost, setHostName as persistHostName } from "@/hooks/useMeeting";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Conversation — LiveSpeak" },
      { name: "description", content: "Set up a new live transcription conversation." },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const meeting = await api.createMeeting({
        name: name.trim() || "Untitled conversation",
        hostName: hostName.trim() || "Host",
      });
      // Persist host flag and name for this device
      if (hostName.trim()) persistHostName(hostName.trim());
      markAsHost(meeting.id);
      await navigate({ to: "/live/$meetingId", params: { meetingId: meeting.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top nav */}
      <nav className="flex items-center gap-3 px-6 py-4 md:px-10">
        <Link
          to="/"
          id="create-back-btn"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex size-7 items-center justify-center rounded-lg bg-signal text-white">
            <AudioLines className="size-3.5" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold text-foreground">
            LiveSpeak
          </span>
        </div>
      </nav>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="panel w-full max-w-md p-8 shadow-lift">
          {/* Header */}
          <div className="mb-8 space-y-1.5">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-signal/10 text-signal">
              <AudioLines className="size-6" aria-hidden />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              New conversation
            </h1>
            <p className="text-sm text-muted-foreground">
              Give your session a name, then share the link with anyone you want
              to listen in.
            </p>
          </div>

          {/* Form */}
          <form
            id="create-conversation-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Conversation name */}
            <div className="space-y-1.5">
              <label
                htmlFor="conversation-name"
                className="text-sm font-medium text-foreground"
              >
                Conversation name
                <span className="ml-1 text-muted-foreground">(optional)</span>
              </label>
              <input
                id="conversation-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Team standup, Interview…"
                maxLength={80}
                autoFocus
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
              />
            </div>

            {/* Your name */}
            <div className="space-y-1.5">
              <label
                htmlFor="host-name"
                className="text-sm font-medium text-foreground"
              >
                Your name
                <span className="ml-1 text-muted-foreground">(optional)</span>
              </label>
              <input
                id="host-name"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={40}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
              />
              <p className="text-xs text-muted-foreground">
                Shown as the speaker label on your transcript lines.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="start-conversation-btn"
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-signal/20 transition-all hover:bg-signal/90 hover:shadow-md hover:shadow-signal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="size-4" aria-hidden />
              )}
              {loading ? "Creating…" : "Create & join"}
            </button>
          </form>

          {/* Info callout */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            You&apos;ll get a shareable link once the room is created.
            <br />
            No account required — anyone with the link can listen.
          </p>
        </div>
      </div>
    </div>
  );
}
