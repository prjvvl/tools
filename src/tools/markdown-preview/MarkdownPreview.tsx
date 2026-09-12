import { useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import { BookOpen, Check, Code2, Copy, Download, Eye, FolderOpen, X } from "lucide-react";
import { buttonVariantClass, errorBannerClass, pillClass } from "../../lib/styles";
import { resolveSiteTheme, watchSiteTheme, type SiteTheme } from "../../lib/theme";
import { renderMarkdown } from "./markdown";
import { EXAMPLE_MARKDOWN } from "./example";

type MobileView = "editor" | "preview";
type CopyStatus = "idle" | "copied" | "failed";

const DEBOUNCE_MS = 200;

function buildStandaloneHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Preview</title>
<style>
  body { max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2328; }
  pre { background: #f6f8fa; padding: 1rem; overflow-x: auto; border-radius: 6px; }
  code { background: #f6f8fa; padding: 0.15em 0.35em; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 0.5rem 0.75rem; }
  blockquote { margin: 0; padding-left: 1rem; border-left: 4px solid #d0d7de; color: #59636e; }
  img { max-width: 100%; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}

let diagramIdCounter = 0;

interface RenderDiagramsOptions {
  /** Skip nodes with no layout box (e.g. behind the mobile Editor/Preview
   * toggle) instead of handing them to mermaid.render, which never
   * resolves for a container inside a display:none ancestor. */
  skipHidden: boolean;
  isCancelled?: () => boolean;
}

/**
 * Renders every `[data-diagram-index]` placeholder in `container` whose
 * source or theme has changed since it was last rendered. Identity comes
 * from the index embedded by markdown.ts, not DOM position, so a failed
 * diagram (which loses its `mermaid` class) still maps to the right source
 * on the next pass instead of shifting the nodes after it out of sync.
 */
async function renderPendingDiagrams(
  container: HTMLElement,
  diagrams: string[],
  theme: SiteTheme,
  { skipHidden, isCancelled }: RenderDiagramsOptions,
): Promise<void> {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-diagram-index]"));
  const pending = nodes
    .map((node) => ({ node, code: diagrams[Number(node.dataset.diagramIndex)] }))
    .filter(
      ({ node, code }) =>
        code !== undefined && (node.dataset.renderedTheme !== theme || node.dataset.renderedSource !== code),
    );
  if (pending.length === 0) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: theme === "dark" ? "dark" : "default",
  });

  for (const { node, code } of pending) {
    if (skipHidden && node.offsetParent === null) continue;
    if (isCancelled?.()) return;

    const id = `md-preview-mermaid-${diagramIdCounter++}`;
    try {
      const { svg } = await mermaid.render(id, code);
      if (isCancelled?.()) return;
      node.className = "mermaid";
      node.innerHTML = svg;
    } catch (err) {
      if (isCancelled?.()) return;
      const message = err instanceof Error ? err.message : "Could not render this diagram.";
      node.innerHTML = "";
      node.className = errorBannerClass;
      node.setAttribute("role", "alert");
      node.textContent = `Invalid Mermaid diagram: ${message}`;
    }
    node.dataset.renderedTheme = theme;
    node.dataset.renderedSource = code;
  }
}

/**
 * Renders `html`'s diagrams in a detached, off-screen container instead of
 * the live preview pane, so Copy HTML and Download HTML always include
 * every diagram even when the preview pane is hidden behind the mobile
 * Editor/Preview toggle - without flashing the visible pane to fetch them.
 */
async function renderMarkdownToHtml(html: string, diagrams: string[], theme: SiteTheme): Promise<string> {
  const scratch = document.createElement("div");
  scratch.style.position = "fixed";
  scratch.style.top = "-9999px";
  scratch.style.left = "-9999px";
  scratch.style.visibility = "hidden";
  scratch.innerHTML = html;
  document.body.appendChild(scratch);
  try {
    await renderPendingDiagrams(scratch, diagrams, theme, { skipHidden: false });
    return scratch.innerHTML;
  } finally {
    document.body.removeChild(scratch);
  }
}

export default function MarkdownPreview() {
  const [source, setSource] = useState("");
  const [debouncedSource, setDebouncedSource] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const [theme, setTheme] = useState<SiteTheme>("dark");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(resolveSiteTheme());
    return watchSiteTheme(setTheme);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSource(source), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [source]);

  const { html, diagrams } = useMemo(
    () => (debouncedSource.trim() ? renderMarkdown(debouncedSource) : { html: "", diagrams: [] }),
    [debouncedSource],
  );

  // Renders each pending placeholder into an SVG once the sanitized HTML has
  // committed to the DOM. Re-runs on `mobileView` too: a diagram whose pane
  // was hidden (display:none) behind the mobile Editor/Preview toggle at
  // render time has no layout box, and mermaid's measurement never resolves
  // against one, so it's skipped below and picked up on the next pass once
  // its pane becomes visible.
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    let cancelled = false;
    renderPendingDiagrams(container, diagrams, theme, { skipHidden: true, isCancelled: () => cancelled });

    return () => {
      cancelled = true;
    };
  }, [html, diagrams, theme, mobileView]);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function handleCopyHtml() {
    try {
      const renderedHtml = await renderMarkdownToHtml(html, diagrams, theme);
      await navigator.clipboard.writeText(renderedHtml);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  async function handleDownloadHtml() {
    const renderedHtml = await renderMarkdownToHtml(html, diagrams, theme);
    const blob = new Blob([buildStandaloneHtml(renderedHtml)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const paneClass = (view: MobileView) => `${mobileView === view ? "block" : "hidden"} lg:block`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3">
        <button type="button" onClick={() => setSource(EXAMPLE_MARKDOWN)} className={buttonVariantClass.secondary}>
          <BookOpen className="size-4" aria-hidden="true" />
          Load Example
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonVariantClass.secondary}>
          <FolderOpen className="size-4" aria-hidden="true" />
          Open File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex-1" />
        <button type="button" onClick={handleCopyHtml} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : copyStatus === "failed" ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy HTML"}
        </button>
        <button type="button" onClick={handleDownloadHtml} className={buttonVariantClass.primary}>
          <Download className="size-4" aria-hidden="true" />
          Download HTML
        </button>
      </div>

      <div className="mt-4 flex gap-2 lg:hidden">
        <button type="button" onClick={() => setMobileView("editor")} className={pillClass(mobileView === "editor")}>
          <Code2 className="size-4" aria-hidden="true" />
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={pillClass(mobileView === "preview")}
        >
          <Eye className="size-4" aria-hidden="true" />
          Preview
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className={paneClass("editor")}>
          <label htmlFor="md-source" className="block text-sm font-medium text-fg">
            Markdown source
          </label>
          <textarea
            id="md-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            placeholder="Paste or drop a .md file, or type Markdown here..."
            spellCheck={false}
            className="mt-2 h-[70vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>

        <div className={paneClass("preview")}>
          <p className="text-sm font-medium text-fg">Preview</p>
          <div className="mt-2 h-[70vh] overflow-y-auto rounded-card border border-border bg-surface p-4">
            <div ref={previewRef} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
