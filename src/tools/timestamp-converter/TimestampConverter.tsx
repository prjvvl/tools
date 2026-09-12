import { useMemo, useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";
import Select from "../../components/Select";

type Unit = "seconds" | "milliseconds";

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

function formatRelative(date: Date): string {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return rtf.format(diffSeconds, "second");
}

export default function TimestampConverter() {
  const [timestampInput, setTimestampInput] = useState("");
  const [unit, setUnit] = useState<Unit>("seconds");
  const [dateInput, setDateInput] = useState("");

  const fromTimestamp = useMemo(() => {
    if (!timestampInput.trim()) return null;
    const value = Number(timestampInput);
    if (!Number.isFinite(value)) return null;
    const date = new Date(unit === "seconds" ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [timestampInput, unit]);

  const timestampError = timestampInput.trim() !== "" && fromTimestamp === null;

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [dateInput]);

  function handleNow() {
    const now = Date.now();
    setTimestampInput(String(unit === "seconds" ? Math.floor(now / 1000) : now));
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="ts-input" className="block text-sm font-medium text-fg">
        Unix timestamp
      </label>
      <div className="mt-2 flex items-end gap-3">
        <input
          id="ts-input"
          type="text"
          inputMode="numeric"
          value={timestampInput}
          onChange={(e) => setTimestampInput(e.target.value)}
          placeholder="1700000000"
          className="min-h-11 flex-1 rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
        />
        <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} aria-label="Timestamp unit">
          <option value="seconds">Seconds</option>
          <option value="milliseconds">Milliseconds</option>
        </Select>
        <button type="button" onClick={handleNow} className={buttonVariantClass.secondary}>
          Now
        </button>
      </div>

      {timestampError && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          Not a valid timestamp.
        </p>
      )}

      {fromTimestamp && (
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6" aria-live="polite">
          <div>
            <p className="mb-2 text-sm font-medium text-fg">ISO 8601 (UTC)</p>
            <CopyField value={fromTimestamp.toISOString()} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Local time</p>
            <CopyField value={fromTimestamp.toString()} />
          </div>
          <p className="text-sm text-fg-muted">{formatRelative(fromTimestamp)}</p>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <label htmlFor="date-input" className="block text-sm font-medium text-fg">
          Date &amp; time (local)
        </label>
        <input
          id="date-input"
          type="datetime-local"
          step="1"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
        />

        {fromDate && (
          <div className="mt-4 flex flex-col gap-4" aria-live="polite">
            <div>
              <p className="mb-2 text-sm font-medium text-fg">Unix seconds</p>
              <CopyField value={String(Math.floor(fromDate.getTime() / 1000))} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-fg">Unix milliseconds</p>
              <CopyField value={String(fromDate.getTime())} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
