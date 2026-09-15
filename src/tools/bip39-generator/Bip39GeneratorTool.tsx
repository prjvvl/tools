import { useState } from "react";
import { generateMnemonic } from "bip39";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";
import Select from "../../components/Select";
import { ensureBufferPolyfill } from "./bufferPolyfill";

const WORD_COUNTS = [
  { value: "12", label: "12 words" },
  { value: "24", label: "24 words" },
] as const;

type WordCount = (typeof WORD_COUNTS)[number]["value"];

// 12 words = 128 bits of entropy, 24 words = 256 bits.
const STRENGTH_BY_WORD_COUNT: Record<WordCount, number> = {
  "12": 128,
  "24": 256,
};

export default function Bip39GeneratorTool() {
  const [wordCount, setWordCount] = useState<WordCount>("12");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    try {
      ensureBufferPolyfill();
      setPhrase(generateMnemonic(STRENGTH_BY_WORD_COUNT[wordCount]));
      setError(null);
    } catch {
      setPhrase("");
      setError("Could not generate a mnemonic in this browser.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className={errorBannerClass} role="alert">
        For learning and testing only. Never generate a real wallet's recovery phrase on a website, and never type an
        existing one into a website, including this one. A genuine seed phrase should only ever be created by
        offline, audited wallet hardware/software.
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="bip39-word-count" className="text-sm text-fg-muted">
          Word count
        </label>
        <Select id="bip39-word-count" value={wordCount} onChange={(e) => setWordCount(e.target.value as WordCount)}>
          {WORD_COUNTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <button type="button" onClick={handleGenerate} className={`mt-4 w-full ${buttonVariantClass.primary}`}>
        Generate
      </button>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {!phrase && !error && (
        <p className="mt-6 text-sm text-fg-muted">Your generated mnemonic will appear here.</p>
      )}

      {phrase && (
        <div className="mt-6 border-t border-border pt-6" aria-live="polite">
          <p className="mb-2 text-sm font-medium text-fg">{wordCount}-word mnemonic</p>
          <CopyField value={phrase} />
        </div>
      )}
    </div>
  );
}
