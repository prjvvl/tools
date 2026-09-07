import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

export default function JsonFormatter() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  function transform(fn: (parsed: unknown) => string) {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setValue(fn(parsed));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  }

  function handleFormat() {
    transform((parsed) => JSON.stringify(parsed, null, 2));
  }

  function handleMinify() {
    transform((parsed) => JSON.stringify(parsed));
  }

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  function handleChange(next: string) {
    setValue(next);
    if (!error) return;
    // Clear a stale error as soon as the content parses again, without
    // requiring the user to press Format/Minify first.
    try {
      if (next.trim()) JSON.parse(next);
      setError(null);
    } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste JSON here..."
        spellCheck={false}
        className="h-80 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleFormat} className={buttonVariantClass.primary}>
          Format
        </button>
        <button type="button" onClick={handleMinify} className={buttonVariantClass.secondary}>
          Minify
        </button>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
    </div>
  );
}
