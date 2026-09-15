import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import { csvToJson, jsonToCsv } from "./csv";

type Mode = "csv-to-json" | "json-to-csv";

export default function CsvJsonConverter() {
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  // Derived directly from input/mode on every render rather than kept in
  // state: this is a pure transformation, not something that needs its
  // own lifecycle, and deriving it avoids a setState-during-render bug.
  let output = "";
  let error: string | null = null;
  if (input.trim()) {
    try {
      output = mode === "csv-to-json" ? JSON.stringify(csvToJson(input), null, 2) : jsonToCsv(input);
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
        <button type="button" onClick={() => switchMode("csv-to-json")} className={modeButtonClass(mode === "csv-to-json")}>
          CSV → JSON
        </button>
        <button type="button" onClick={() => switchMode("json-to-csv")} className={modeButtonClass(mode === "json-to-csv")}>
          JSON → CSV
        </button>
      </div>

      <label htmlFor="csv-json-input" className="mt-6 block text-sm font-medium text-fg">
        {mode === "csv-to-json" ? "CSV" : "JSON"}
      </label>
      <textarea
        id="csv-json-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          mode === "csv-to-json"
            ? "name,age\nAda,36\nGrace,85"
            : '[\n  { "name": "Ada", "age": 36 },\n  { "name": "Grace", "age": 85 }\n]'
        }
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <label htmlFor="csv-json-output" className="block text-sm font-medium text-fg">
          {mode === "csv-to-json" ? "JSON" : "CSV"}
        </label>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
      <textarea
        id="csv-json-output"
        value={output}
        readOnly
        spellCheck={false}
        className="mt-2 h-40 w-full rounded-card border border-border bg-surface p-3 font-mono text-sm text-fg-muted focus:border-brand-300 focus:outline-none"
      />
    </div>
  );
}
