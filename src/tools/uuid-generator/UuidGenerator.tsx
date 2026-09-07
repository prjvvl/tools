import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type CopyStatus = "copied" | "failed";

export default function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [rowStatus, setRowStatus] = useState<{ index: number; status: CopyStatus } | null>(null);
  const [allStatus, setAllStatus] = useState<CopyStatus | null>(null);

  function handleGenerate() {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
    setRowStatus(null);
    setAllStatus(null);
  }

  async function handleCopyOne(id: string, index: number) {
    try {
      await navigator.clipboard.writeText(id);
      setRowStatus({ index, status: "copied" });
    } catch {
      setRowStatus({ index, status: "failed" });
    }
    setTimeout(() => setRowStatus((current) => (current?.index === index ? null : current)), 1500);
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setAllStatus("copied");
    } catch {
      setAllStatus("failed");
    }
    setTimeout(() => setAllStatus(null), 1500);
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="uuid-count" className="block text-sm font-medium text-fg">
            How many?
          </label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(clamp(Number(e.target.value) || 1, 1, 50))}
            className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
          />
        </div>
        <button type="button" onClick={handleGenerate} className={buttonVariantClass.primary}>
          Generate
        </button>
      </div>

      {uuids.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">Generated UUIDs will appear here.</p>
      ) : (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-fg-muted">{uuids.length} generated</p>
            <button type="button" onClick={handleCopyAll} className={buttonVariantClass.secondary}>
              {allStatus === "copied" ? "Copied!" : allStatus === "failed" ? "Copy failed" : "Copy All"}
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
            {uuids.map((id, index) => (
              <li
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-bg px-3 py-2"
              >
                <code className="truncate font-mono text-sm text-fg">{id}</code>
                <button type="button" onClick={() => handleCopyOne(id, index)} className={buttonVariantClass.ghost}>
                  {rowStatus?.index === index
                    ? rowStatus.status === "copied"
                      ? "Copied"
                      : "Failed"
                    : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
