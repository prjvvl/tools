import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Code2, Copy, Download, Eye, FolderOpen, X } from "lucide-react";
import { buttonVariantClass, pillClass } from "../../lib/styles";
import { EXAMPLE_HTML } from "./example";

type MobileView = "editor" | "preview";
type CopyStatus = "idle" | "copied" | "failed";

const DEBOUNCE_MS = 200;

export default function HtmlPreview() {
  const [source, setSource] = useState("");
  const [debouncedSource, setDebouncedSource] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSource(source), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [source]);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function handleCopy() {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  function handleDownload() {
    if (!source) return;
    const blob = new Blob([source], { type: "text/html;charset=utf-8" });
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
        <button type="button" onClick={() => setSource(EXAMPLE_HTML)} className={buttonVariantClass.secondary}>
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
          accept=".html,.htm,.txt"
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
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy HTML"}
        </button>
        <button type="button" onClick={handleDownload} className={buttonVariantClass.primary}>
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
          <label htmlFor="html-source" className="block text-sm font-medium text-fg">
            HTML source
          </label>
          <textarea
            id="html-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            placeholder="Paste or drop an .html file, or type HTML here..."
            spellCheck={false}
            className="mt-2 h-[70vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
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
              srcDoc={debouncedSource}
              sandbox="allow-scripts"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
