export type SiteTheme = "dark" | "light";

/**
 * Mirrors ThemeToggle.astro's own resolution: an explicit stored choice
 * wins, otherwise fall back to the system preference. Any tool that embeds
 * a third-party renderer with its own theme concept (Monaco, Mermaid, ...)
 * needs this so that renderer doesn't drift from the site's actual theme.
 */
export function resolveSiteTheme(): SiteTheme {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light") return "light";
  if (stored === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Calls `onChange` whenever the resolved site theme changes: either the
 * toggle flips `data-theme` (an explicit choice) or, absent one, the OS
 * preference changes. Returns an unsubscribe function.
 */
export function watchSiteTheme(onChange: (theme: SiteTheme) => void): () => void {
  const update = () => onChange(resolveSiteTheme());

  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", update);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", update);
  };
}
