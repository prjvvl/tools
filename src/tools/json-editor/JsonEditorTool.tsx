import { useEffect, useRef, useState } from "react";
import { createJSONEditor, type Content, type JsonEditor as JsonEditorInstance } from "vanilla-jsoneditor";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

const DEFAULT_CONTENT: Content = {
  json: {
    name: "vanilla-jsoneditor",
    description: "Paste, edit, and validate JSON in tree, table, or text view.",
    features: ["tree view", "table view", "text view", "JSON Schema validation"],
    nested: {
      active: true,
      count: 3,
    },
  },
};

/**
 * Mirrors ThemeToggle.astro's own resolution (see text-editor's
 * resolveSiteTheme): an explicit stored choice wins, otherwise fall back to
 * the system preference. vanilla-jsoneditor switches to its dark palette
 * when a `jse-theme-dark` class is present on an ancestor element, so this
 * only needs to toggle a class rather than reach into the editor's props.
 */
function resolveSiteIsDark(): boolean {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return !window.matchMedia("(prefers-color-scheme: light)").matches;
}

export default function JsonEditorTool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JsonEditorInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => (typeof document !== "undefined" ? resolveSiteIsDark() : true));

  // Create the editor once on mount and destroy it on unmount/cleanup. This
  // is the load-bearing part of the integration: vanilla-jsoneditor is a
  // vanilla/Svelte widget mounted imperatively against a DOM node, not a
  // React component, so React never re-renders its internals. Skipping
  // `.destroy()` here would leave a duplicate instance mounted into the
  // same container on Fast Refresh/re-mount.
  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = createJSONEditor({
      target: containerRef.current,
      props: {
        content: DEFAULT_CONTENT,
        onError: (err: Error) => setError(err.message),
      },
    });

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const update = () => setIsDark(resolveSiteIsDark());

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  function handleReset() {
    setError(null);
    editorRef.current?.update(DEFAULT_CONTENT);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button type="button" onClick={handleReset} className={buttonVariantClass.secondary}>
          Reset Sample
        </button>
      </div>

      {error && (
        <div className={errorBannerClass} role="alert">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className={`h-[70vh] w-full overflow-hidden rounded-card border border-border ${isDark ? "jse-theme-dark" : ""}`}
      />
    </div>
  );
}
