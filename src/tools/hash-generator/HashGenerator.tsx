import { useEffect, useState } from "react";
import { errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";
import Select from "../../components/Select";

const ALGORITHMS = [
  { value: "SHA-1", label: "SHA-1" },
  { value: "SHA-256", label: "SHA-256" },
  { value: "SHA-384", label: "SHA-384" },
  { value: "SHA-512", label: "SHA-512" },
] as const;

type Algorithm = (typeof ALGORITHMS)[number]["value"];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [hash, setHash] = useState("");

  const subtleAvailable = typeof crypto !== "undefined" && Boolean(crypto.subtle);

  useEffect(() => {
    if (!subtleAvailable || !input) {
      setHash("");
      return;
    }

    let cancelled = false;

    (async () => {
      const data = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest(algorithm, data);
      if (!cancelled) setHash(toHex(digest));
    })();

    return () => {
      cancelled = true;
    };
  }, [input, algorithm, subtleAvailable]);

  if (!subtleAvailable) {
    return (
      <div className={`mx-auto max-w-2xl ${errorBannerClass}`} role="alert">
        Hashing needs the Web Crypto API, only available in a secure context (HTTPS or localhost).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="hash-input" className="block text-sm font-medium text-fg">
        Text
      </label>
      <textarea
        id="hash-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text to hash..."
        rows={6}
        className="mt-2 w-full rounded-card border border-border bg-bg p-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="hash-algorithm" className="text-sm text-fg-muted">
          Algorithm
        </label>
        <Select id="hash-algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}>
          {ALGORITHMS.map((algo) => (
            <option key={algo.value} value={algo.value}>
              {algo.label}
            </option>
          ))}
        </Select>
      </div>

      {hash && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium text-fg">{algorithm} digest</p>
          <CopyField value={hash} />
        </div>
      )}
    </div>
  );
}
