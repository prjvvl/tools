import { useEffect, useRef, useState } from "react";
import { ensureMonacoEnvironment, monaco } from "./monacoSetup";
import { buttonVariantClass } from "../../lib/styles";
import Select from "../../components/Select";

const DEFAULT_CONTENT = `// Welcome to the Text Editor

function hello() {
  console.log("Start writing your code here.");
}
`;

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
] as const;

const EXTENSION_MAP: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  go: "go",
  html: "html",
  css: "css",
  json: "json",
  markdown: "md",
  plaintext: "txt",
};

interface PageMeta {
  id: number;
  name: string;
  language: string;
  diffEnabled: boolean;
}

interface PageModels {
  model: monaco.editor.ITextModel | null;
  original: monaco.editor.ITextModel | null;
  modified: monaco.editor.ITextModel | null;
}

function isUntouched(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed === DEFAULT_CONTENT.trim();
}

function pageHasContent(page: PageMeta, models: PageModels | undefined) {
  if (!models) return false;
  if (page.diffEnabled) {
    return !isUntouched(models.original?.getValue() ?? "") || !isUntouched(models.modified?.getValue() ?? "");
  }
  return !isUntouched(models.model?.getValue() ?? "");
}

/**
 * Mirrors ThemeToggle.astro's own resolution: an explicit stored choice
 * wins, otherwise fall back to the system preference. The editor has no
 * theme control of its own: a second, independent light/dark switch next
 * to the site's own would just be a confusing duplicate.
 */
function resolveSiteTheme(): "vs-dark" | "vs" {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light") return "vs";
  if (stored === "dark") return "vs-dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "vs" : "vs-dark";
}

export default function TextEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const modelsRef = useRef<Map<number, PageModels>>(new Map());
  const idCounterRef = useRef(0);
  const nameCounterRef = useRef(1);

  const [pages, setPages] = useState<PageMeta[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [theme, setTheme] = useState<"vs-dark" | "vs">(resolveSiteTheme);

  const activePage = pages.find((p) => p.id === activeId) ?? null;

  function createPage(language: string, initialContent = "") {
    const id = idCounterRef.current++;
    const model = monaco.editor.createModel(initialContent, language);
    modelsRef.current.set(id, { model, original: null, modified: null });
    setPages((prev) => [...prev, { id, name: `Page ${nameCounterRef.current++}`, language, diffEnabled: false }]);
    setActiveId(id);
  }

  // Always keep at least one page open. Covers both first mount and the
  // moment the last remaining tab is closed.
  useEffect(() => {
    if (pages.length === 0) {
      ensureMonacoEnvironment();
      createPage("javascript", DEFAULT_CONTENT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  // Recreate the mounted editor whenever the active page or its diff mode
  // changes. Theme is handled separately below so switching themes doesn't
  // tear down and rebuild the editor instance.
  useEffect(() => {
    if (!containerRef.current || !activePage) return;
    const models = modelsRef.current.get(activePage.id);
    if (!models) return;

    editorRef.current?.dispose();
    diffEditorRef.current?.dispose();
    editorRef.current = null;
    diffEditorRef.current = null;

    if (activePage.diffEnabled && models.original && models.modified) {
      const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
        theme,
        automaticLayout: true,
        renderSideBySide: true,
      });
      diffEditor.setModel({ original: models.original, modified: models.modified });
      diffEditor.getOriginalEditor().updateOptions({ readOnly: false });
      diffEditorRef.current = diffEditor;
    } else if (models.model) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        model: models.model,
        theme,
        automaticLayout: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage?.id, activePage?.diffEnabled]);

  // Global re-theme in place, matching Monaco's own theme model (one theme
  // shared by every editor instance) instead of recreating the editor.
  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  // Watches for ThemeToggle.astro flipping `data-theme` (an explicit
  // choice) and for the system preference changing (when there's no
  // explicit choice yet), keeping the editor in sync with the site theme.
  useEffect(() => {
    const update = () => setTheme(resolveSiteTheme());

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasUnsaved = pages.some((page) => pageHasContent(page, modelsRef.current.get(page.id)));
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pages]);

  // Dispose every model and editor instance on unmount so navigating away
  // from this page doesn't leak Monaco's workers or DOM nodes.
  useEffect(() => {
    return () => {
      editorRef.current?.dispose();
      diffEditorRef.current?.dispose();
      modelsRef.current.forEach(({ model, original, modified }) => {
        model?.dispose();
        original?.dispose();
        modified?.dispose();
      });
      modelsRef.current.clear();
    };
  }, []);

  function removePage(id: number) {
    const page = pages.find((p) => p.id === id);
    const models = modelsRef.current.get(id);
    if (page && pageHasContent(page, models)) {
      if (!window.confirm("This page has unsaved content. It will be lost. Continue?")) return;
    }

    models?.model?.dispose();
    models?.original?.dispose();
    models?.modified?.dispose();
    modelsRef.current.delete(id);

    const remaining = pages.filter((p) => p.id !== id);
    setPages(remaining);
    if (activeId === id) {
      setActiveId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  }

  function setLanguage(id: number, language: string) {
    const models = modelsRef.current.get(id);
    if (models) {
      if (models.model) monaco.editor.setModelLanguage(models.model, language);
      if (models.original) monaco.editor.setModelLanguage(models.original, language);
      if (models.modified) monaco.editor.setModelLanguage(models.modified, language);
    }
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, language } : p)));
  }

  function toggleDiff(id: number, enabled: boolean) {
    const page = pages.find((p) => p.id === id);
    const models = modelsRef.current.get(id);
    if (!page || !models) return;

    if (enabled) {
      const value = models.model?.getValue() ?? "";
      models.original = monaco.editor.createModel(value, page.language);
      models.modified = monaco.editor.createModel(value, page.language);
      models.model?.dispose();
      models.model = null;
    } else {
      const value = models.modified?.getValue() ?? "";
      models.original?.dispose();
      models.modified?.dispose();
      models.original = null;
      models.modified = null;
      models.model = monaco.editor.createModel(value, page.language);
    }

    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, diffEnabled: enabled } : p)));
  }

  function handleSave() {
    if (!activePage) return;
    const models = modelsRef.current.get(activePage.id);
    const content = activePage.diffEnabled ? models?.modified?.getValue() ?? "" : models?.model?.getValue() ?? "";
    if (!content.trim()) return;

    const extension = EXTENSION_MAP[activePage.language] ?? "txt";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePage.name}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => setActiveId(page.id)}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-card border px-3 text-sm transition-colors duration-200 ${
                page.id === activeId
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-border text-fg-muted hover:border-brand-300 hover:text-fg"
              }`}
            >
              {page.name}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removePage(page.id);
                }}
                aria-label={`Close ${page.name}`}
                className="opacity-70 hover:opacity-100"
              >
                &times;
              </span>
            </div>
          ))}
          <button type="button" onClick={() => createPage("javascript")} className={buttonVariantClass.secondary}>
            + Page
          </button>
        </div>

        <label className="flex min-h-11 items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={activePage?.diffEnabled ?? false}
            onChange={(e) => activePage && toggleDiff(activePage.id, e.target.checked)}
            className="size-4 accent-[var(--color-brand)]"
          />
          Diff Mode
        </label>

        <Select
          value={activePage?.language ?? "javascript"}
          onChange={(e) => activePage && setLanguage(activePage.id, e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>

        <button type="button" onClick={handleSave} className={buttonVariantClass.primary}>
          Save
        </button>
      </div>

      <div ref={containerRef} className="h-[70vh] w-full overflow-hidden rounded-card border border-border" />
    </div>
  );
}
