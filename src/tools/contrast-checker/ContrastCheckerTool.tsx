import { useMemo, useState } from "react";
import { errorBannerClass } from "../../lib/styles";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(input: string): Rgb | null {
  const hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  return null;
}

function toHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

/** Standard sRGB -> linear -> relative luminance, per WCAG 2.x. */
function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  const rl = channel(r);
  const gl = channel(g);
  const bl = channel(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface Criterion {
  label: string;
  threshold: number;
}

const CRITERIA: Criterion[] = [
  { label: "AA - Normal text", threshold: 4.5 },
  { label: "AA - Large text", threshold: 3 },
  { label: "AAA - Normal text", threshold: 7 },
  { label: "AAA - Large text", threshold: 4.5 },
];

export default function ContrastCheckerTool() {
  const [fgInput, setFgInput] = useState("#ffffff");
  const [bgInput, setBgInput] = useState("#111827");

  const fg = useMemo(() => parseHex(fgInput), [fgInput]);
  const bg = useMemo(() => parseHex(bgInput), [bgInput]);
  const fgInvalid = fgInput.trim() !== "" && fg === null;
  const bgInvalid = bgInput.trim() !== "" && bg === null;

  const ratio = fg && bg ? contrastRatio(fg, bg) : null;

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fg-hex" className="block text-sm font-medium text-fg">
            Foreground
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={fg ? toHex(fg) : "#000000"}
              onChange={(e) => setFgInput(e.target.value)}
              aria-label="Pick foreground color"
              className="size-11 shrink-0 cursor-pointer rounded-card border border-border bg-bg p-1"
            />
            <input
              id="fg-hex"
              type="text"
              value={fgInput}
              onChange={(e) => setFgInput(e.target.value)}
              placeholder="#ffffff"
              className="min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bg-hex" className="block text-sm font-medium text-fg">
            Background
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={bg ? toHex(bg) : "#000000"}
              onChange={(e) => setBgInput(e.target.value)}
              aria-label="Pick background color"
              className="size-11 shrink-0 cursor-pointer rounded-card border border-border bg-bg p-1"
            />
            <input
              id="bg-hex"
              type="text"
              value={bgInput}
              onChange={(e) => setBgInput(e.target.value)}
              placeholder="#111827"
              className="min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {(fgInvalid || bgInvalid) && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          Not a recognized hex color. Try something like #ffffff or #111827.
        </p>
      )}

      {ratio !== null && fg && bg && (
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6" aria-live="polite">
          <div
            className="flex h-24 items-center justify-center rounded-card border border-border text-lg font-medium"
            style={{ color: toHex(fg), backgroundColor: toHex(bg) }}
          >
            Sample text
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Contrast ratio</p>
            <p className="text-lg font-semibold text-fg">{ratio.toFixed(2)}:1</p>
          </div>

          <div className="flex flex-col gap-2">
            {CRITERIA.map((criterion) => {
              const pass = ratio >= criterion.threshold;
              return (
                <div
                  key={criterion.label}
                  className="flex items-center justify-between rounded-card border border-border bg-bg px-3 py-2 text-sm"
                >
                  <span className="text-fg">
                    {criterion.label} <span className="text-fg-muted">({criterion.threshold}:1)</span>
                  </span>
                  <span className={pass ? "text-success" : "text-error"}>{pass ? "Pass" : "Fail"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
