import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

const inputClass =
  "min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none";

const textareaClass =
  "mt-2 h-64 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none";

export default function JsonToTypescriptTool() {
  const [input, setInput] = useState("");
  const [typeName, setTypeName] = useState("RootObject");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleGenerate() {
    if (!input.trim()) {
      setError("Paste a JSON sample first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Loaded lazily so the (large, Node-oriented) quicktype-core bundle is
      // fetched only once someone actually presses Generate, and only inside
      // this client-only island's own chunk.
      const { jsonToTypeScript } = await import("./quicktypeClient");
      const result = await jsonToTypeScript(input, typeName.trim() || "RootObject");
      setOutput(result);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate TypeScript from that JSON.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="json-to-ts-input" className="block text-sm font-medium text-fg">
        Sample JSON
      </label>
      <textarea
        id="json-to-ts-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"id": 1, "name": "Ada"}'
        spellCheck={false}
        className={textareaClass}
      />

      <label htmlFor="json-to-ts-typename" className="mt-4 block text-sm font-medium text-fg">
        Root type name
      </label>
      <input
        id="json-to-ts-typename"
        type="text"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        placeholder="RootObject"
        spellCheck={false}
        className={`mt-2 ${inputClass}`}
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-4">
        <button type="button" onClick={handleGenerate} disabled={loading} className={buttonVariantClass.primary}>
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
        {!hasGenerated && !loading && (
          <p className="text-sm text-fg-muted">Your generated TypeScript interfaces will appear here.</p>
        )}
        {hasGenerated && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg">Generated TypeScript</span>
              <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
                {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              className={textareaClass}
            />
          </>
        )}
      </div>
    </div>
  );
}
