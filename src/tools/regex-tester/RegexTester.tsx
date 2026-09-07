import { useMemo, useState } from "react";
import { errorBannerClass } from "../../lib/styles";

const FLAG_OPTIONS = [
  { key: "i", label: "Case insensitive (i)" },
  { key: "m", label: "Multiline (m)" },
  { key: "s", label: "Dot matches newline (s)" },
] as const;

interface MatchInfo {
  index: number;
  match: string;
  groups: string[];
}

interface Segment {
  text: string;
  isMatch: boolean;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set());
  const [testString, setTestString] = useState("");

  function toggleFlag(key: string) {
    setActiveFlags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const { error, matches, segments } = useMemo(() => {
    if (!pattern) {
      return { error: null, matches: [] as MatchInfo[], segments: [{ text: testString, isMatch: false }] as Segment[] };
    }

    try {
      const flags = "g" + Array.from(activeFlags).join("");
      const regex = new RegExp(pattern, flags);
      const found = Array.from(testString.matchAll(regex));

      const matches: MatchInfo[] = found.map((m) => ({
        index: m.index ?? 0,
        match: m[0],
        groups: m.slice(1).map((g) => g ?? ""),
      }));

      const segments: Segment[] = [];
      let cursor = 0;
      for (const m of found) {
        const start = m.index ?? 0;
        if (start > cursor) segments.push({ text: testString.slice(cursor, start), isMatch: false });
        if (m[0].length > 0) {
          segments.push({ text: m[0], isMatch: true });
          cursor = start + m[0].length;
        } else {
          cursor = start;
        }
      }
      if (cursor < testString.length) segments.push({ text: testString.slice(cursor), isMatch: false });

      return { error: null, matches, segments };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Invalid regular expression",
        matches: [] as MatchInfo[],
        segments: [{ text: testString, isMatch: false }] as Segment[],
      };
    }
  }, [pattern, activeFlags, testString]);

  const fieldClass =
    "min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none font-mono";
  const textareaClass =
    "mt-2 min-h-32 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none font-mono";

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="regex-pattern" className="block text-sm font-medium text-fg">
        Pattern
      </label>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-fg-muted">/</span>
        <input
          id="regex-pattern"
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="[a-z]+"
          className={`${fieldClass} flex-1`}
        />
        <span className="text-fg-muted">/{Array.from(activeFlags).join("")}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {FLAG_OPTIONS.map((flag) => (
          <label key={flag.key} className="flex min-h-11 items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={activeFlags.has(flag.key)}
              onChange={() => toggleFlag(flag.key)}
              className="size-4 accent-[var(--color-brand)]"
            />
            {flag.label}
          </label>
        ))}
      </div>

      <label htmlFor="regex-test-string" className="mt-6 block text-sm font-medium text-fg">
        Test string
      </label>
      <textarea
        id="regex-test-string"
        value={testString}
        onChange={(e) => setTestString(e.target.value)}
        placeholder="Paste text to test your pattern against..."
        rows={6}
        className={textareaClass}
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {!error && testString && (
        <div className="mt-6 border-t border-border pt-6">
          <h2 className="text-sm font-medium text-fg">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </h2>
          <p className="mt-3 rounded-card border border-border bg-bg p-3 font-mono text-sm whitespace-pre-wrap break-words text-fg">
            {segments.map((seg, i) =>
              seg.isMatch ? (
                <mark key={i} className="rounded bg-brand-100 px-0.5 text-brand-900">
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </p>

          {matches.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {matches.map((m, i) => (
                <li key={i} className="rounded-card border border-border bg-bg px-3 py-2 text-sm">
                  <span className="text-fg-muted">
                    #{i + 1} at {m.index}:
                  </span>{" "}
                  <span className="font-mono text-fg">{m.match}</span>
                  {m.groups.length > 0 && (
                    <span className="ml-2 text-fg-muted">groups: {m.groups.map((g) => `"${g}"`).join(", ")}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
