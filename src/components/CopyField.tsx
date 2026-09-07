import { useState } from "react";
import { buttonVariantClass } from "../lib/styles";

interface Props {
  value: string;
  mono?: boolean;
}

/**
 * The shared shape for "here's one generated value, copy it": used by
 * every tool that produces a single output on demand (password, UUID list
 * items, hash digest, etc.) so they don't each invent their own element,
 * font size, and copy-feedback timing.
 */
export default function CopyField({ value, mono = true }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="flex gap-2" role="status" aria-live="polite">
      <code
        className={`min-h-11 flex-1 overflow-x-auto rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg ${mono ? "font-mono" : ""}`}
      >
        {value}
      </code>
      <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
        {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : "Copy"}
      </button>
    </div>
  );
}
