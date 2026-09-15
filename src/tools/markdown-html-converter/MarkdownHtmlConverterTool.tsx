import { useMemo, useState } from "react";
import { errorBannerClass, pillClass } from "../../lib/styles";
import { buttonVariantClass } from "../../lib/styles";
import { markdownToHtml, htmlToMarkdown } from "./converter";

type Mode = "md2html" | "html2md";

const DEFAULT_MARKDOWN = "# Hello\n\nThis is **bold** text with a [link](https://example.com).";
const DEFAULT_HTML = "<h1>Hello</h1>\n<p>This is <strong>bold</strong> text with a <a href=\"https://example.com\">link</a>.</p>";

export default function MarkdownHtmlConverterTool() {
  const [mode, setMode] = useState<Mode>("md2html");
  const [mdInput, setMdInput] = useState(DEFAULT_MARKDOWN);
  const [htmlInput, setHtmlInput] = useState(DEFAULT_HTML);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => (mode === "md2html" ? markdownToHtml(mdInput) : htmlToMarkdown(htmlInput)),
    [mode, mdInput, htmlInput],
  );

  async function handleCopy() {
    if (!result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 1500);
  }

  const inputLabel = mode === "md2html" ? "Markdown source" : "HTML source";
  const outputLabel = mode === "md2html" ? "HTML output" : "Markdown output";

  return (
    <div className="mx-auto max-w-6xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("md2html")} className={pillClass(mode === "md2html")}>
          Markdown → HTML
        </button>
        <button type="button" onClick={() => setMode("html2md")} className={pillClass(mode === "html2md")}>
          HTML → Markdown
        </button>
      </div>

      {result.error && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          {result.error}
        </p>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="mhc-input" className="block text-sm font-medium text-fg">
            {inputLabel}
          </label>
          <textarea
            id="mhc-input"
            value={mode === "md2html" ? mdInput : htmlInput}
            onChange={(e) => (mode === "md2html" ? setMdInput(e.target.value) : setHtmlInput(e.target.value))}
            spellCheck={false}
            placeholder={mode === "md2html" ? "Type or paste Markdown here..." : "Type or paste HTML here..."}
            className="mt-2 h-[50vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="mhc-output" className="block text-sm font-medium text-fg">
              {outputLabel}
            </label>
            <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            id="mhc-output"
            value={result.value}
            readOnly
            spellCheck={false}
            aria-live="polite"
            className="mt-2 h-[50vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
