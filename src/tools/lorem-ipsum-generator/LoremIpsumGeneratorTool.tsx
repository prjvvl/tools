import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";
import Select from "../../components/Select";
import { WORDS } from "./words";

type Unit = "paragraphs" | "sentences" | "words";

const UNIT_LABELS: Record<Unit, string> = {
  paragraphs: "Paragraphs",
  sentences: "Sentences",
  words: "Words",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Random integer in [min, max], via crypto.getRandomValues (never Math.random). */
function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return min + (values[0] % range);
}

function randomWord(): string {
  return WORDS[randomInt(0, WORDS.length - 1)];
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateSentence(): string {
  const length = randomInt(6, 14);
  const words = Array.from({ length }, () => randomWord());
  let sentence = words.join(" ");
  // Occasionally drop in a comma for rhythm.
  if (length > 8) {
    const commaIndex = randomInt(3, length - 3);
    const parts = sentence.split(" ");
    parts[commaIndex] = parts[commaIndex] + ",";
    sentence = parts.join(" ");
  }
  return capitalize(sentence) + ".";
}

function generateParagraph(): string {
  const sentenceCount = randomInt(4, 7);
  return Array.from({ length: sentenceCount }, () => generateSentence()).join(" ");
}

function generate(unit: Unit, count: number): string {
  if (unit === "words") {
    return capitalize(Array.from({ length: count }, () => randomWord()).join(" ")) + ".";
  }
  if (unit === "sentences") {
    return Array.from({ length: count }, () => generateSentence()).join(" ");
  }
  return Array.from({ length: count }, () => generateParagraph()).join("\n\n");
}

export default function LoremIpsumGeneratorTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setOutput(generate(unit, count));
    setCopied(false);
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="lorem-unit" className="block text-sm font-medium text-fg">
            Unit
          </label>
          <Select
            id="lorem-unit"
            className="mt-2"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
          >
            {(Object.keys(UNIT_LABELS) as Unit[]).map((key) => (
              <option key={key} value={key}>
                {UNIT_LABELS[key]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="lorem-count" className="block text-sm font-medium text-fg">
            Count
          </label>
          <input
            id="lorem-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(clamp(Number(e.target.value) || 1, 1, 50))}
            className="mt-2 min-h-11 w-24 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
          />
        </div>
        <button type="button" onClick={handleGenerate} className={buttonVariantClass.primary}>
          Generate
        </button>
      </div>

      {!output && (
        <p className="mt-6 text-sm text-fg-muted">Your generated placeholder text will appear here.</p>
      )}

      {output && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Output</p>
            <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            aria-live="polite"
            className="mt-2 w-full resize-y rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-brand-300 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
