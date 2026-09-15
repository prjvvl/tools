import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";

type Mode = "encode" | "decode";

const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function encode(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ENTITY_MAP[char]);
}

function decode(text: string): string {
  // Detached, unrendered element: innerHTML parses entities but nothing is
  // ever appended to the live DOM or executed, so this carries no XSS risk.
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

export default function HtmlEntitiesTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const output = input ? (mode === "encode" ? encode(input) : decode(input)) : "";

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

      <label htmlFor="html-entities-input" className="mt-6 block text-sm font-medium text-fg">
        {mode === "encode" ? "Text" : "HTML with entities"}
      </label>
      <textarea
        id="html-entities-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Text to encode..." : "Entities to decode..."}
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <div className="mt-6 flex items-center justify-between">
        <label htmlFor="html-entities-output" className="block text-sm font-medium text-fg">
          {mode === "encode" ? "HTML with entities" : "Text"}
        </label>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
      <textarea
        id="html-entities-output"
        value={output}
        readOnly
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-surface p-3 font-mono text-sm text-fg-muted focus:border-brand-300 focus:outline-none"
      />
    </div>
  );
}
