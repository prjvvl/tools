import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { resolveSiteTheme, watchSiteTheme } from "../../lib/theme";

/**
 * Excalidraw fills 100% of its parent's width/height, so it needs a
 * container with an explicit, real height rather than one that just grows
 * with its content. This accounts for the two pieces of chrome that sit
 * above the canvas on every tool page (see Nav.astro and ToolLayout.astro):
 *  - Nav.astro: a sticky header whose row is dominated by its min-h-11
 *    (2.75rem) controls plus py-3 (1.5rem) padding, on top of the safe-area
 *    inset on notched devices.
 *  - ToolLayout.astro: wraps every tool in `py-8` (2rem top + 2rem bottom).
 * Subtracting both keeps the canvas from being clipped and avoids a naive
 * `100vh` that would run under notches/browser chrome on mobile.
 */
const CANVAS_STYLE: React.CSSProperties = {
  height: "calc(100dvh - 8.25rem - env(safe-area-inset-top, 0px))",
  minHeight: "420px",
};

export default function WhiteboardTool() {
  // One-time-ish read of the site's current theme, kept in sync with
  // ThemeToggle.astro via the same watcher Monaco's TextEditor tool uses,
  // so the canvas doesn't drift from the rest of the site.
  const [theme, setTheme] = useState<"light" | "dark">(resolveSiteTheme);

  useEffect(() => watchSiteTheme(setTheme), []);

  return (
    <div className="w-full" style={CANVAS_STYLE}>
      <Excalidraw theme={theme} />
    </div>
  );
}
