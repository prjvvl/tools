import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Shown the instant the sanitized HTML lands in the DOM, before mermaid
 * (a large, separately-loaded chunk) has parsed and rendered anything.
 * Without a shaped placeholder, the diagram's area sits empty for however
 * long that takes on the visitor's connection, which reads as a broken
 * preview rather than a loading one: same reasoning AGENTS.md gives for
 * skeleton placeholders generally.
 */
export const MERMAID_PENDING_CLASS =
  "mermaid rounded-card border border-border bg-bg px-3 py-2 font-mono text-xs whitespace-pre-wrap text-fg-muted";

/**
 * Collects each ```mermaid block's raw source, in document order, for the
 * render call currently in progress. Reset at the top of `renderMarkdown`
 * and read back immediately after; safe as module state because
 * `marked.parse` runs synchronously start-to-finish with `{ async: false }`,
 * so calls never interleave.
 *
 * The div is left empty rather than holding the diagram source as text: an
 * earlier version put it there (and, for re-renders, in a `data-source`
 * attribute), but DOMPurify strips any attribute value containing `-->` as
 * an XSS mitigation against mutation-XSS via comment-breakout tricks -
 * exactly the sequence Mermaid uses to draw arrows, so any real flowchart's
 * source was being silently stripped. Handing the source to
 * MarkdownPreview out-of-band avoids the sanitizer entirely instead of
 * trying to carve out an exception to it.
 */
let currentDiagrams: string[] = [];

marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === "mermaid") {
        currentDiagrams.push(text);
        return `<div class="${MERMAID_PENDING_CLASS}"></div>`;
      }
      return false;
    },
  },
});

export interface MarkdownRenderResult {
  html: string;
  /** Raw Mermaid source for each `.mermaid` placeholder, in document order. */
  diagrams: string[];
}

export function renderMarkdown(source: string): MarkdownRenderResult {
  currentDiagrams = [];
  const html = marked.parse(source, { async: false }) as string;
  return { html: DOMPurify.sanitize(html), diagrams: currentDiagrams };
}
