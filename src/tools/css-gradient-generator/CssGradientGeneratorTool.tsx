import { useMemo, useRef, useState } from "react";
import { buttonVariantClass, pillClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";

type GradientType = "linear" | "radial";

interface Stop {
  id: number;
  color: string;
  position: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildGradient(type: GradientType, angle: number, stops: Stop[]): string {
  const stopList = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  return type === "linear" ? `linear-gradient(${angle}deg, ${stopList})` : `radial-gradient(circle, ${stopList})`;
}

export default function CssGradientGeneratorTool() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: "#7c3aed", position: 0 },
    { id: 2, color: "#06b6d4", position: 100 },
  ]);
  const nextStopId = useRef(3);

  const gradient = useMemo(() => buildGradient(type, angle, stops), [type, angle, stops]);
  const css = `background: ${gradient};`;

  function updateStop(id: number, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addStop() {
    setStops((prev) => [...prev, { id: nextStopId.current++, color: "#ffffff", position: 50 }]);
  }

  function removeStop(id: number) {
    setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex gap-2">
        <button type="button" onClick={() => setType("linear")} className={pillClass(type === "linear")}>
          Linear
        </button>
        <button type="button" onClick={() => setType("radial")} className={pillClass(type === "radial")}>
          Radial
        </button>
      </div>

      {type === "linear" && (
        <div className="mt-4">
          <label htmlFor="gradient-angle" className="flex items-center justify-between text-sm font-medium text-fg">
            Angle
            <span className="text-fg-muted">{angle}deg</span>
          </label>
          <input
            id="gradient-angle"
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="mt-2 h-2 w-full accent-[var(--color-brand)]"
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-sm font-medium text-fg">Color stops</p>
        {stops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 py-2">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(stop.id, { color: e.target.value })}
              aria-label="Stop color"
              className="size-9 shrink-0 cursor-pointer rounded-card border border-border bg-bg p-1"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => updateStop(stop.id, { position: clamp(Number(e.target.value) || 0, 0, 100) })}
              aria-label="Stop position percent"
              className="min-h-11 w-20 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
            />
            <span className="text-sm text-fg-muted">%</span>
            <button
              type="button"
              onClick={() => removeStop(stop.id)}
              disabled={stops.length <= 2}
              className={`ml-auto ${buttonVariantClass.ghost} disabled:opacity-40`}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addStop} className={`self-start ${buttonVariantClass.secondary}`}>
          Add stop
        </button>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <div className="h-40 w-full rounded-card border border-border" style={{ background: gradient }} />
        <p className="mt-4 mb-2 text-sm font-medium text-fg">CSS</p>
        <CopyField value={css} />
      </div>
    </div>
  );
}
