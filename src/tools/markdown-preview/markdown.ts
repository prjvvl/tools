import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Shown the instant the sanitized HTML lands in the DOM, before mermaid
 * (a large, separately-loaded chunk) has parsed and rendered anything.
 * Without a shaped placeholder, the diagram's raw source sits there as an
 * unstyled wall of text for however long that takes on the visitor's
 * connection, which reads as a broken preview rather than a loading one:
 * same reasoning AGENTS.md gives for skeleton placeholders generally.
 */
export const MERMAID_PENDING_CLASS =
  "mermaid rounded-card border border-border bg-bg px-3 py-2 font-mono text-xs whitespace-pre-wrap text-fg-muted";

/**
 * The only override on top of marked's default GFM rendering: a fenced
 * ```mermaid block becomes a <div class="mermaid ..."> holding the raw
 * diagram source as text, instead of a syntax-highlighted <pre><code>.
 * MarkdownPreview finds these divs after the sanitized HTML is in the DOM
 * and replaces each one with mermaid's rendered SVG (or an error banner).
 * marked HTML-escapes `text` for us via the renderer's default escaping
 * rules for code blocks, so the diagram source round-trips through
 * `.textContent` unchanged.
 */
marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === "mermaid") {
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<div class="${MERMAID_PENDING_CLASS}">${escaped}</div>`;
      }
      return false;
    },
  },
});

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html);
}
