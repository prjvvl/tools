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

export default function HmacGeneratorTool() {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [hmac, setHmac] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtleAvailable = typeof crypto !== "undefined" && Boolean(crypto.subtle);

  // Mirrors hash-generator's async digest pattern: crypto.subtle work is
  // inherently async, so a fast second edit could otherwise resolve before
  // (or race with) an earlier one and overwrite it with a stale result. The
  // `cancelled` flag guards against that: only the effect run that's still
  // current when its own promise resolves is allowed to call setHmac.
  useEffect(() => {
    if (!subtleAvailable || !message || !secretKey) {
      setHmac("");
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const keyData = new TextEncoder().encode(secretKey);
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: algorithm },
          false,
          ["sign"],
        );
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
        if (!cancelled) {
          setHmac(toHex(signature));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setHmac("");
          setError(err instanceof Error ? err.message : "Could not compute the HMAC.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [message, secretKey, algorithm, subtleAvailable]);

  if (!subtleAvailable) {
    return (
      <div className={`mx-auto max-w-2xl ${errorBannerClass}`} role="alert">
        HMAC generation needs the Web Crypto API, only available in a secure context (HTTPS or localhost).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="hmac-message" className="block text-sm font-medium text-fg">
        Message
      </label>
      <textarea
        id="hmac-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type or paste the message to authenticate..."
        rows={6}
        className="mt-2 w-full rounded-card border border-border bg-bg p-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <label htmlFor="hmac-secret" className="mt-4 block text-sm font-medium text-fg">
        Secret key
      </label>
      <input
        id="hmac-secret"
        type="text"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        placeholder="Shared secret..."
        className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="hmac-algorithm" className="text-sm text-fg-muted">
          Algorithm
        </label>
        <Select id="hmac-algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}>
          {ALGORITHMS.map((algo) => (
            <option key={algo.value} value={algo.value}>
              {algo.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {hmac && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium text-fg">HMAC-{algorithm} digest</p>
          <CopyField value={hmac} />
        </div>
      )}
    </div>
  );
}
