import { useState, useCallback } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { meetingLink } from "@/lib/api";

interface ShareButtonProps {
  meetingId: string;
  className?: string;
}

export function ShareButton({ meetingId, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const link = meetingLink(meetingId);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [meetingId]);

  return (
    <button
      id="share-meeting-btn"
      onClick={handleCopy}
      aria-label="Copy shareable link"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium",
        "text-foreground transition-all duration-150",
        "hover:border-signal/50 hover:bg-accent hover:text-signal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50",
        "active:scale-[0.97]",
        copied && "border-signal/40 bg-signal/5 text-signal",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <Link2 className="size-3.5 shrink-0" aria-hidden />
      )}
      <span>{copied ? "Copied!" : "Share link"}</span>
    </button>
  );
}
