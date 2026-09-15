import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import { diffJson, type DiffNode } from "./diff";
import DiffTreeView from "./DiffTreeView";

const textareaClass =
  "mt-2 min-h-48 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none font-mono";

export default function JsonDiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiffNode | null>(null);

  function handleCompare() {
    let leftParsed: unknown;
    let rightParsed: unknown;
    try {
      leftParsed = JSON.parse(left);
    } catch (err) {
      setError(`Left JSON is invalid: ${err instanceof Error ? err.message : "could not parse."}`);
      setResult(null);
      return;
    }
    try {
      rightParsed = JSON.parse(right);
    } catch (err) {
      setError(`Right JSON is invalid: ${err instanceof Error ? err.message : "could not parse."}`);
      setResult(null);
      return;
    }
    setError(null);
    setResult(diffJson(leftParsed, rightParsed));
  }

  const hasDiff = result?.status !== "unchanged";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="json-diff-left" className="block text-sm font-medium text-fg">
            Left JSON
          </label>
          <textarea
            id="json-diff-left"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder='{"id": 1, "name": "Ada"}'
            spellCheck={false}
            rows={12}
            className={textareaClass}
          />
        </div>
        <div>
          <label htmlFor="json-diff-right" className="block text-sm font-medium text-fg">
            Right JSON
          </label>
          <textarea
            id="json-diff-right"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder='{"id": 1, "name": "Grace"}'
            spellCheck={false}
            rows={12}
            className={textareaClass}
          />
        </div>
      </div>

      <button type="button" onClick={handleCompare} className={`mt-4 ${buttonVariantClass.primary}`}>
        Compare
      </button>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-6" aria-live="polite">
        {!result && !error && (
          <p className="text-sm text-fg-muted">Paste JSON on both sides and press Compare to see the diff.</p>
        )}
        {result &&
          (hasDiff ? (
            <DiffTreeView root={result} />
          ) : (
            <p className="rounded-card border border-border bg-bg p-3 text-sm text-fg-muted">No differences found.</p>
          ))}
      </div>
    </div>
  );
}
