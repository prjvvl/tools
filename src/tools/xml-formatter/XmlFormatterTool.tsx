import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

function parseXml(input: string): Document {
  const doc = new DOMParser().parseFromString(input, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || "Invalid XML.");
  }
  return doc;
}

/** Recursively re-serializes an element tree with 2-space indentation. */
function indentNode(node: Element, depth: number): string {
  const indent = "  ".repeat(depth);
  const attrs = Array.from(node.attributes)
    .map((attr) => ` ${attr.name}="${attr.value}"`)
    .join("");

  const children = Array.from(node.childNodes).filter(
    (child) => !(child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()),
  );

  if (children.length === 0) {
    return `${indent}<${node.tagName}${attrs} />`;
  }

  // A single text-only child stays on one line: <tag>value</tag>.
  if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
    return `${indent}<${node.tagName}${attrs}>${children[0].textContent?.trim() ?? ""}</${node.tagName}>`;
  }

  const inner = children
    .map((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) return indentNode(child as Element, depth + 1);
      if (child.nodeType === Node.COMMENT_NODE) return `${"  ".repeat(depth + 1)}<!--${child.textContent}-->`;
      if (child.nodeType === Node.CDATA_SECTION_NODE) return `${"  ".repeat(depth + 1)}<![CDATA[${child.textContent}]]>`;
      if (child.nodeType === Node.TEXT_NODE) return `${"  ".repeat(depth + 1)}${child.textContent?.trim()}`;
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `${indent}<${node.tagName}${attrs}>\n${inner}\n${indent}</${node.tagName}>`;
}

function formatXml(doc: Document): string {
  return doc.documentElement ? indentNode(doc.documentElement, 0) : "";
}

/** Removes whitespace-only text nodes between tags, recursively. */
function stripWhitespace(node: Node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) {
      node.removeChild(child);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      stripWhitespace(child);
    }
  }
}

function minifyXml(doc: Document): string {
  if (!doc.documentElement) return "";
  const clone = doc.documentElement.cloneNode(true) as Element;
  stripWhitespace(clone);
  return new XMLSerializer().serializeToString(clone);
}

export default function XmlFormatterTool() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  function transform(fn: (doc: Document) => string) {
    if (!value.trim()) return;
    try {
      const doc = parseXml(value);
      setValue(fn(doc));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid XML.");
    }
  }

  function handleFormat() {
    transform(formatXml);
  }

  function handleMinify() {
    transform(minifyXml);
  }

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus("idle"), 1500);
  }

  function handleChange(next: string) {
    setValue(next);
    if (error) setError(null);
  }

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste XML here..."
        spellCheck={false}
        aria-live="polite"
        className="h-80 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {!value.trim() && <p className="mt-4 text-sm text-fg-muted">Paste XML above, then Format or Minify.</p>}

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleFormat} className={buttonVariantClass.primary}>
          Format
        </button>
        <button type="button" onClick={handleMinify} className={buttonVariantClass.secondary}>
          Minify
        </button>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>
    </div>
  );
}
