/**
 * Shared Tailwind class strings for patterns that need to look identical in
 * both Astro components and React islands. Astro components can't be
 * imported into React, so a React island that needs a card or button
 * can't reuse Card.astro/Button.astro directly; importing these avoids
 * copy-pasting the class string a second time, where the two copies can
 * silently drift apart.
 */
export const cardClickableClass =
  "hover-elevate block h-full rounded-card border border-border bg-surface p-6 hover:border-brand-300";

export function pillClass(active: boolean): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-3 text-sm transition-colors duration-200 ${
    active
      ? "bg-brand text-brand-fg"
      : "border border-border text-fg-muted hover:border-brand-300 hover:text-fg"
  }`;
}

const buttonBaseClass =
  "hover-elevate inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-5 py-2.5 text-sm font-medium";

export const buttonVariantClass = {
  primary: `${buttonBaseClass} bg-brand text-brand-fg hover:bg-brand-700`,
  secondary: `${buttonBaseClass} border border-border text-fg hover:border-brand-300 hover:bg-surface`,
  /** For a control inside an already-dense row (a list item, a tab bar)
   * where a fully bordered button would be visually heavier than the
   * content around it. Still a real min-h-11 touch target, just no
   * border/background of its own. */
  ghost: "inline-flex min-h-11 items-center justify-center px-2 text-sm text-fg-muted hover:text-fg",
} as const;

/** Shared by every tool with a native <select> (language/theme pickers,
 * algorithm choosers, etc.) so they don't each redeclare the same string. */
export const selectClass =
  "min-h-11 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none";

/** Shared by every tool with an inline validation/error message. Pair with
 * `role="alert"` at the usage site (a class string can't carry an
 * attribute) so screen readers announce it when it appears. */
export const errorBannerClass = "rounded-card border border-error bg-error-bg px-4 py-3 text-sm text-error";
