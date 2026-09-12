import { useMemo, useState } from "react";
import { errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseColor(input: string): Rgb | null {
  const value = input.trim();
  const hex = value.replace(/^#/, "");
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
  const rgbMatch = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const [r, g, b] = [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
    if ([r, g, b].every((c) => c >= 0 && c <= 255)) return { r, g, b };
  }
  return null;
}

function toHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function toRgb({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function toHsl({ r, g, b }: Rgb): string {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      default:
        h = (rN - gN) / d + 4;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorConverter() {
  const [input, setInput] = useState("#7c3aed");

  const rgb = useMemo(() => parseColor(input), [input]);
  const invalid = input.trim() !== "" && rgb === null;

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="color-input" className="block text-sm font-medium text-fg">
        Color (hex or rgb)
      </label>
      <div className="mt-2 flex items-center gap-3">
        <input
          id="color-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#7c3aed"
          className="min-h-11 flex-1 rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
        />
        <input
          type="color"
          value={rgb ? toHex(rgb) : "#000000"}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Pick a color"
          className="size-11 shrink-0 cursor-pointer rounded-card border border-border bg-bg p-1"
        />
      </div>

      {invalid && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          Not a recognized color. Try a hex code like #7c3aed or rgb(124, 58, 237).
        </p>
      )}

      {rgb && (
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6" aria-live="polite">
          <div
            className="h-16 rounded-card border border-border"
            style={{ backgroundColor: toRgb(rgb) }}
            aria-hidden="true"
          />
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Hex</p>
            <CopyField value={toHex(rgb)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">RGB</p>
            <CopyField value={toRgb(rgb)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">HSL</p>
            <CopyField value={toHsl(rgb)} />
          </div>
        </div>
      )}
    </div>
  );
}
