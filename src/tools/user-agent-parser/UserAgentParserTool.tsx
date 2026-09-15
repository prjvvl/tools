import { useEffect, useMemo, useState } from "react";
import { UAParser } from "ua-parser-js";

const EMPTY = "—";

function orDash(value: string | undefined | null): string {
  return value && value.trim() !== "" ? value : EMPTY;
}

export default function UserAgentParserTool() {
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(navigator.userAgent);
  }, []);

  const result = useMemo(() => new UAParser(ua).getResult(), [ua]);

  const rows: { label: string; value: string }[] = [
    { label: "Browser", value: [result.browser.name, result.browser.version].filter(Boolean).join(" ") || EMPTY },
    { label: "Engine", value: [result.engine.name, result.engine.version].filter(Boolean).join(" ") || EMPTY },
    { label: "OS", value: [result.os.name, result.os.version].filter(Boolean).join(" ") || EMPTY },
    { label: "Device type", value: orDash(result.device.type) },
    { label: "Device vendor", value: orDash(result.device.vendor) },
    { label: "Device model", value: orDash(result.device.model) },
  ];

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="ua-input" className="block text-sm font-medium text-fg">
        User-Agent string
      </label>
      <textarea
        id="ua-input"
        value={ua}
        onChange={(e) => setUa(e.target.value)}
        spellCheck={false}
        rows={3}
        placeholder="Paste a User-Agent string here..."
        className="mt-2 w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-6" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-sm text-fg-muted">{row.label}</dt>
            <dd className="font-mono text-sm text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
