import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

type Mode = "encode" | "decode";

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function decode(text: string): string {
  const binary = atob(text);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  // Derived directly from input/mode on every render rather than kept in
  // state: this is a pure transformation, not something that needs its
  // own lifecycle, and deriving it avoids a setState-during-render bug.
  let output = "";
  let error: string | null = null;
  try {
    output = input ? (mode === "encode" ? encode(input) : decode(input)) : "";
  } catch {
    error = "Invalid Base64 input. Check for missing characters or padding.";
  }

  function switchMode(next: Mode) {
    setMode(next);
    setInput("");
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  const modeButtonClass = (active: boolean) =>
    `min-h-11 flex-1 rounded-card border px-4 text-sm font-medium transition-colors duration-200 ${
      active ? "border-brand bg-brand text-brand-fg" : "border-border text-fg-muted hover:border-brand-300 hover:text-fg"
    }`;

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex gap-2">
        <button type="button" onClick={() => switchMode("encode")} className={modeButtonClass(mode === "encode")}>
          Encode
        </button>
        <button type="button" onClick={() => switchMode("decode")} className={modeButtonClass(mode === "decode")}>
          Decode
        </button>
      </div>

      <label htmlFor="base64-input" className="mt-6 block text-sm font-medium text-fg">
        {mode === "encode" ? "Text" : "Base64"}
      </label>
      <textarea
        id="base64-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Text to encode..." : "Base64 to decode..."}
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <label htmlFor="base64-output" className="block text-sm font-medium text-fg">
          {mode === "encode" ? "Base64" : "Text"}
        </label>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
      <textarea
        id="base64-output"
        value={output}
        readOnly
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-surface p-3 font-mono text-sm text-fg-muted focus:border-brand-300 focus:outline-none"
      />
    </div>
  );
}
