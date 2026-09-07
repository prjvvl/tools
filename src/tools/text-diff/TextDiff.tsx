import { useState } from "react";
import { diffLines, type Change } from "diff";
import { buttonVariantClass } from "../../lib/styles";

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [result, setResult] = useState<Change[] | null>(null);

  function handleCompare() {
    setResult(diffLines(original, changed));
  }

  const textareaClass =
    "mt-2 min-h-48 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none font-mono";

  const hasDiff = result?.some((part) => part.added || part.removed) ?? false;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="diff-original" className="block text-sm font-medium text-fg">
            Original
          </label>
          <textarea
            id="diff-original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste the original text..."
            rows={10}
            className={textareaClass}
          />
        </div>
        <div>
          <label htmlFor="diff-changed" className="block text-sm font-medium text-fg">
            Changed
          </label>
          <textarea
            id="diff-changed"
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            placeholder="Paste the changed text..."
            rows={10}
            className={textareaClass}
          />
        </div>
      </div>

      <button type="button" onClick={handleCompare} className={`mt-4 ${buttonVariantClass.primary}`}>
        Compare
      </button>

      {result &&
        (hasDiff ? (
          <div className="mt-6 overflow-x-auto rounded-card border border-border bg-bg py-2">
            {result.map((part, i) => {
              const lines = part.value.replace(/\n$/, "").split("\n");
              const tone = part.added ? "bg-success-bg text-success" : part.removed ? "bg-error-bg text-error" : "text-fg-muted";
              const prefix = part.added ? "+" : part.removed ? "-" : " ";

              return lines.map((line, j) => (
                <div key={`${i}-${j}`} className={`px-3 py-0.5 font-mono text-sm whitespace-pre-wrap break-words ${tone}`}>
                  <span className="mr-1 select-none opacity-60">{prefix}</span>
                  {line}
                </div>
              ));
            })}
          </div>
        ) : (
          <p className="mt-6 rounded-card border border-border bg-bg p-3 text-sm text-fg-muted">No differences found.</p>
        ))}
    </div>
  );
}
