import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";

const turndownService = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

export interface ConversionResult {
  value: string;
  error: string | null;
}

/** Markdown source -> sanitized HTML source. Mirrors markdown-preview's sanitization step. */
export function markdownToHtml(source: string): ConversionResult {
  if (source.trim() === "") return { value: "", error: null };
  try {
    const html = marked.parse(source, { async: false }) as string;
    return { value: DOMPurify.sanitize(html), error: null };
  } catch (err) {
    return { value: "", error: err instanceof Error ? err.message : "Could not convert this Markdown." };
  }
}

/** HTML source -> Markdown, sanitizing the HTML (same approach as markdown-preview) before Turndown sees it. */
export function htmlToMarkdown(source: string): ConversionResult {
  if (source.trim() === "") return { value: "", error: null };
  try {
    const sanitized = DOMPurify.sanitize(source);
    return { value: turndownService.turndown(sanitized), error: null };
  } catch (err) {
    return { value: "", error: err instanceof Error ? err.message : "Could not convert this HTML." };
  }
}
