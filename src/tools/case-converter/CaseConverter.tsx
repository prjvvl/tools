import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";

/**
 * Splits text into words across whitespace, hyphens, underscores, AND
 * camelCase/PascalCase boundaries, so identifier-style conversions (camel,
 * Pascal, snake, kebab, CONSTANT) work correctly no matter what casing or
 * separator the input already uses.
 */
function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const IDENTIFIER_CASES = {
  camelCase: (text: string) => {
    const words = splitWords(text);
    return words.map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w))).join("");
  },
  PascalCase: (text: string) => splitWords(text).map(capitalize).join(""),
  snake_case: (text: string) =>
    splitWords(text)
      .map((w) => w.toLowerCase())
      .join("_"),
  "kebab-case": (text: string) =>
    splitWords(text)
      .map((w) => w.toLowerCase())
      .join("-"),
  CONSTANT_CASE: (text: string) =>
    splitWords(text)
      .map((w) => w.toUpperCase())
      .join("_"),
} as const;

// These operate on the original string in place (preserving whitespace,
// line breaks, and punctuation) rather than re-joining split words, since
// that's what "Title Case" etc. mean for prose, unlike identifier casing.
const TEXT_CASES = {
  "Title Case": (text: string) => text.toLowerCase().replace(/[a-z0-9]+/gi, (word) => capitalize(word)),
  "Sentence case": (text: string) => {
    const lower = text.toLowerCase();
    return lower.replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (match) => match.toUpperCase());
  },
  lowercase: (text: string) => text.toLowerCase(),
  UPPERCASE: (text: string) => text.toUpperCase(),
} as const;

const ALL_CASES = { ...IDENTIFIER_CASES, ...TEXT_CASES };

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleConvert = (transform: (text: string) => string) => {
    setText((current) => transform(current));
    setCopyStatus("idle");
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="case-input" className="block text-sm font-medium text-fg">
        Text
      </label>
      <textarea
        id="case-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
        rows={8}
        className="mt-2 w-full resize-y rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(ALL_CASES).map(([label, transform]) => (
          <button
            key={label}
            type="button"
            onClick={() => handleConvert(transform)}
            disabled={!text.trim()}
            className={`${buttonVariantClass.secondary} disabled:pointer-events-none disabled:opacity-60`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!text}
        className={`mt-4 w-full ${buttonVariantClass.primary} disabled:pointer-events-none disabled:opacity-60`}
      >
        {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
      </button>
    </div>
  );
}
