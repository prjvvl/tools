import { useMemo, useState } from "react";
import { buttonVariantClass } from "../../lib/styles";
import { PRESETS } from "./presets";

function buildOutput(selectedIds: string[]): string {
  const seen = new Set<string>();
  const sections: string[] = [];

  for (const id of selectedIds) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) continue;

    const lines = preset.body
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        // Keep blank lines and comments as-is (structure), but dedupe real
        // rule lines that another selected preset already emitted.
        if (trimmed === "" || trimmed.startsWith("#")) return true;
        if (seen.has(trimmed)) return false;
        seen.add(trimmed);
        return true;
      });

    if (lines.length === 0) continue;
    sections.push(`### ${preset.label} ###\n${lines.join("\n")}`);
  }

  return sections.join("\n\n");
}

export default function GitignoreGeneratorTool() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => buildOutput(PRESETS.filter((p) => selected.has(p.id)).map((p) => p.id)), [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <p className="text-sm font-medium text-fg">Include rules for</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => (
          <label
            key={preset.id}
            className="flex min-h-11 items-center gap-2 rounded-card border border-border bg-bg px-3 text-sm text-fg"
          >
            <input
              type="checkbox"
              checked={selected.has(preset.id)}
              onChange={() => toggle(preset.id)}
              className="size-4 accent-[var(--color-brand)]"
            />
            {preset.label}
          </label>
        ))}
      </div>

      {!output && (
        <p className="mt-6 text-sm text-fg-muted">Pick one or more presets above to build your .gitignore.</p>
      )}

      {output && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">.gitignore</p>
            <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={16}
            className="mt-2 w-full resize-y rounded-card border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-brand-300 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
