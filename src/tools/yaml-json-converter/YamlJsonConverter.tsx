import { useState } from "react";
import { parse, stringify } from "yaml";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

type Mode = "yaml-to-json" | "json-to-yaml";

export default function YamlJsonConverter() {
  const [mode, setMode] = useState<Mode>("yaml-to-json");
  const [input, setInput] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  // Derived directly from input/mode on every render rather than kept in
  // state: this is a pure transformation, not something that needs its
  // own lifecycle, and deriving it avoids a setState-during-render bug.
  let output = "";
  let error: string | null = null;
  if (input.trim()) {
    try {
      if (mode === "yaml-to-json") {
        output = JSON.stringify(parse(input), null, 2);
      } else {
        output = stringify(JSON.parse(input));
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Conversion failed.";
    }
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
        <button type="button" onClick={() => switchMode("yaml-to-json")} className={modeButtonClass(mode === "yaml-to-json")}>
          YAML → JSON
        </button>
        <button type="button" onClick={() => switchMode("json-to-yaml")} className={modeButtonClass(mode === "json-to-yaml")}>
          JSON → YAML
        </button>
      </div>

      <label htmlFor="yaml-json-input" className="mt-6 block text-sm font-medium text-fg">
        {mode === "yaml-to-json" ? "YAML" : "JSON"}
      </label>
      <textarea
        id="yaml-json-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "yaml-to-json" ? "Paste YAML here..." : "Paste JSON here..."}
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <label htmlFor="yaml-json-output" className="block text-sm font-medium text-fg">
          {mode === "yaml-to-json" ? "JSON" : "YAML"}
        </label>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
      <textarea
        id="yaml-json-output"
        value={output}
        readOnly
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-surface p-3 font-mono text-sm text-fg-muted focus:border-brand-300 focus:outline-none"
      />
    </div>
  );
}
