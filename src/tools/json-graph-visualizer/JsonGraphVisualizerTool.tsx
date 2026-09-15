import { useEffect, useState } from "react";
import { JSONCrack } from "jsoncrack-react";
import "jsoncrack-react/style.css";
import { errorBannerClass } from "../../lib/styles";

const DEFAULT_INPUT = JSON.stringify(
  {
    user: {
      id: 1,
      name: "Ada Lovelace",
      roles: ["admin", "staff"],
      active: true,
    },
    projects: [
      { id: "p1", title: "Analytical Engine" },
      { id: "p2", title: "Difference Engine" },
    ],
  },
  null,
  2,
);

/** Mirrors text-editor's resolveSiteTheme: an explicit stored choice wins,
 * otherwise fall back to the system preference. jsoncrack-react's `theme`
 * prop only accepts "dark" | "light", which maps directly onto that. */
function resolveSiteTheme(): "dark" | "light" {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light") return "light";
  if (stored === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function JsonGraphVisualizerTool() {
  const [text, setText] = useState(DEFAULT_INPUT);
  // The graph keeps rendering the last successfully-parsed JSON while the
  // textarea holds invalid input, instead of going blank on every keystroke
  // of an in-progress edit.
  const [graphJson, setGraphJson] = useState<unknown>(() => JSON.parse(DEFAULT_INPUT));
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    typeof document !== "undefined" ? resolveSiteTheme() : "dark",
  );

  useEffect(() => {
    const update = () => setTheme(resolveSiteTheme());

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  function handleChange(next: string) {
    setText(next);
    if (!next.trim()) {
      setError("Enter JSON to visualize.");
      return;
    }
    try {
      const parsed = JSON.parse(next);
      setGraphJson(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      <div className="flex flex-col gap-3 lg:w-2/5">
        <label htmlFor="json-graph-input" className="text-sm font-medium text-fg-muted">
          JSON input
        </label>
        <textarea
          id="json-graph-input"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste JSON here..."
          spellCheck={false}
          className="h-64 w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none lg:h-[70vh]"
        />
        {error && (
          <div className={errorBannerClass} role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="min-h-[50vh] flex-1 overflow-hidden rounded-card border border-border lg:h-[70vh]">
        <JSONCrack json={graphJson as object} theme={theme} className="h-full w-full" />
      </div>
    </div>
  );
}
