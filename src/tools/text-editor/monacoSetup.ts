import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

let configured = false;

/**
 * Monaco spins up a web worker per language for things like JSON/CSS/HTML
 * validation and TS/JS IntelliSense. Without this, it falls back to running
 * that work on the main thread with a console warning. Idempotent and only
 * ever called from this tool's own page, so it never runs for a visitor who
 * hasn't opened the text editor.
 */
export function ensureMonacoEnvironment() {
  if (configured) return;
  configured = true;

  (self as typeof self & { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      switch (label) {
        case "json":
          return new JsonWorker();
        case "css":
        case "scss":
        case "less":
          return new CssWorker();
        case "html":
        case "handlebars":
        case "razor":
          return new HtmlWorker();
        case "typescript":
        case "javascript":
          return new TsWorker();
        default:
          return new EditorWorker();
      }
    },
  };
}

export { monaco };
