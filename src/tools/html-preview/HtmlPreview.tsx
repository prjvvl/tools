import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Copy, Download, Eye, FolderOpen, X } from "lucide-react";
import { buttonVariantClass, pillClass } from "../../lib/styles";
import { EXAMPLE_CSS, EXAMPLE_HTML, EXAMPLE_JS } from "./example";

type Tab = "html" | "css" | "js";
type MobileView = "editor" | "preview";
type CopyStatus = "idle" | "copied" | "failed";

const DEBOUNCE_MS = 200;

const TABS: { id: Tab; label: string; accept: string; placeholder: string }[] = [
  { id: "html", label: "HTML", accept: ".html,.htm,.txt", placeholder: "<h1>Hello, world!</h1>" },
  { id: "css", label: "CSS", accept: ".css,.txt", placeholder: "h1 { color: #7c3aed; }" },
  { id: "js", label: "JS", accept: ".js,.txt", placeholder: "console.log('Hello!');" },
];

function buildDocument(html: string, css: string, js: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
${css}
</style>
</head>
<body>
${html}
<script>
${js}
</script>
</body>
</html>
`;
}

export default function HtmlPreview() {
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [debounced, setDebounced] = useState({ html: "", css: "", js: "" });
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced({ html, css, js }), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const sourceByTab: Record<Tab, [string, (next: string) => void]> = {
    html: [html, setHtml],
    css: [css, setCss],
    js: [js, setJs],
  };
  const [activeSource, setActiveSource] = sourceByTab[tab];
  const activeTabMeta = TABS.find((t) => t.id === tab)!;

  function loadExample() {
    setHtml(EXAMPLE_HTML);
    setCss(EXAMPLE_CSS);
    setJs(EXAMPLE_JS);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setActiveSource(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function handleCopy() {
    if (!activeSource) return;
    try {
      await navigator.clipboard.writeText(activeSource);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  function handleDownload() {
    const blob = new Blob([buildDocument(html, css, js)], { type: "text/html;charset=utf-8" });
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
        <button type="button" onClick={loadExample} className={buttonVariantClass.secondary}>
          <BookOpen className="size-4" aria-hidden="true" />
          Load Example
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonVariantClass.secondary}>
          <FolderOpen className="size-4" aria-hidden="true" />
          Open File into {activeTabMeta.label}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={activeTabMeta.accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex-1" />
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : copyStatus === "failed" ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : `Copy ${activeTabMeta.label}`}
        </button>
        <button type="button" onClick={handleDownload} className={buttonVariantClass.primary}>
          <Download className="size-4" aria-hidden="true" />
          Download HTML
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Source">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setMobileView("editor");
              }}
              className={pillClass(tab === t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`${pillClass(mobileView === "preview")} lg:hidden`}
        >
          <Eye className="size-4" aria-hidden="true" />
          Preview
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className={paneClass("editor")}>
          <label htmlFor="source-editor" className="block text-sm font-medium text-fg">
            {activeTabMeta.label} source
          </label>
          <textarea
            id="source-editor"
            value={activeSource}
            onChange={(e) => setActiveSource(e.target.value)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            placeholder={`Paste or drop a file, or type ${activeTabMeta.label} here...\ne.g. ${activeTabMeta.placeholder}`}
            spellCheck={false}
            className="mt-2 h-[65vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>

        <div className={paneClass("preview")}>
          <p className="text-sm font-medium text-fg">
            Preview{" "}
            <span className="font-normal text-fg-muted">— runs in a sandboxed frame, isolated from this page</span>
          </p>
          <div className="mt-2 h-[70vh] overflow-hidden rounded-card border border-border bg-white">
            <iframe
              title="HTML preview"
              srcDoc={buildDocument(debounced.html, debounced.css, debounced.js)}
              sandbox="allow-scripts"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
