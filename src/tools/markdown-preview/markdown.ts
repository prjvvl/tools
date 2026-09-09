import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * The only override on top of marked's default GFM rendering: a fenced
 * ```mermaid block becomes a plain <div class="mermaid"> holding the raw
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
        return `<div class="mermaid">${escaped}</div>`;
      }
      return false;
    },
  },
});

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html);
}
