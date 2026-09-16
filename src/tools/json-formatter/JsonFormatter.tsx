import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

// Repeatedly strips one layer of JSON-string escaping (backslash-escaped
// quotes, possibly without surrounding quotes) until the result is valid
// JSON or no further layer can be removed.
function unescapeJsonString(input: string): string {
  let current = input.trim();
  for (let i = 0; i < 10; i++) {
    const candidate = current.startsWith('"') && current.endsWith('"') ? current : `"${current}"`;
    let unwrapped: unknown;
    try {
      unwrapped = JSON.parse(candidate);
    } catch {
      break;
    }
    if (typeof unwrapped !== "string" || unwrapped === current) break;
    current = unwrapped;
    try {
      JSON.parse(current);
      break;
    } catch {
      // Still escaped: loop again to strip another layer.
    }
  }
  return current;
}

// Parses text into a JSON value, unescaping it first if it's a
// backslash-escaped JSON string rather than plain JSON.
function tryParseJsonValue(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  if (trimmed[0] !== "{" && trimmed[0] !== "[" && trimmed[0] !== '"') return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    const unescaped = unescapeJsonString(trimmed);
    if (unescaped === trimmed) return undefined;
    try {
      return JSON.parse(unescaped);
    } catch {
      return undefined;
    }
  }
}

// Walks the parsed JSON tree and recursively unescapes any string value
// that is itself an escaped/stringified object or array, so nested layers
// of escaping (e.g. a field whose value is a JSON-stringified object) get
// resolved too, not just the outermost one.
function deepUnescape(value: unknown): unknown {
  if (typeof value === "string") {
    const parsed = tryParseJsonValue(value);
    if (parsed !== undefined && typeof parsed === "object" && parsed !== null) {
      return deepUnescape(parsed);
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(deepUnescape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepUnescape(v)]));
  }
  return value;
}

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

  function handleUnescape() {
    if (!value.trim()) return;
    try {
      const unescaped = unescapeJsonString(value);
      let result = unescaped;
      try {
        result = JSON.stringify(deepUnescape(JSON.parse(unescaped)), null, 2);
      } catch {
        // Unescaped text still isn't valid JSON on its own; leave it as-is
        // so the user can see and fix the remainder.
      }
      setValue(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unescape this string.");
    }
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
        <button type="button" onClick={handleUnescape} className={buttonVariantClass.secondary}>
          Unescape
        </button>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
    </div>
  );
}
