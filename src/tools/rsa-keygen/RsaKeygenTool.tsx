import { useState } from "react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import Select from "../../components/Select";

const KEY_SIZES = [
  { value: "2048", label: "2048-bit" },
  { value: "4096", label: "4096-bit" },
] as const;

type KeySize = (typeof KEY_SIZES)[number]["value"];

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function toPem(base64: string, label: string): string {
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.slice(i, i + 64));
  }
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

interface CopyBlockProps {
  label: string;
  value: string;
}

function CopyBlock({ label, value }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write can fail silently (permissions); nothing else to do
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-fg">{label}</p>
        <button type="button" onClick={handleCopy} className={buttonVariantClass.secondary}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto rounded-card border border-border bg-bg p-4 font-mono text-xs whitespace-pre text-fg"
        aria-live="polite"
      >
        {value}
      </pre>
    </div>
  );
}

export default function RsaKeygenTool() {
  const [keySize, setKeySize] = useState<KeySize>("2048");
  const [publicPem, setPublicPem] = useState("");
  const [privatePem, setPrivatePem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtleAvailable = typeof crypto !== "undefined" && Boolean(crypto.subtle);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: Number(keySize),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
      );

      const [spki, pkcs8] = await Promise.all([
        crypto.subtle.exportKey("spki", keyPair.publicKey),
        crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
      ]);

      setPublicPem(toPem(bytesToBase64(new Uint8Array(spki)), "PUBLIC KEY"));
      setPrivatePem(toPem(bytesToBase64(new Uint8Array(pkcs8)), "PRIVATE KEY"));
    } catch {
      setError("Could not generate a key pair. Your browser may not support RSA-OAEP key generation.");
      setPublicPem("");
      setPrivatePem("");
    } finally {
      setLoading(false);
    }
  }

  if (!subtleAvailable) {
    return (
      <div className={`mx-auto max-w-2xl ${errorBannerClass}`} role="alert">
        Key generation needs the Web Crypto API, only available in a secure context (HTTPS or localhost).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <label htmlFor="rsa-key-size" className="text-sm text-fg-muted">
          Key size
        </label>
        <Select id="rsa-key-size" value={keySize} onChange={(e) => setKeySize(e.target.value as KeySize)}>
          {KEY_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </Select>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className={`mt-4 w-full ${buttonVariantClass.primary} disabled:opacity-50`}
      >
        {loading ? "Generating..." : "Generate Key Pair"}
      </button>

      {keySize === "4096" && (
        <p className="mt-2 text-xs text-fg-muted">4096-bit generation can take several seconds.</p>
      )}

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {!publicPem && !privatePem && !error && (
        <p className="mt-6 text-sm text-fg-muted">Your generated key pair will appear here.</p>
      )}

      {publicPem && privatePem && (
        <div className="mt-6 flex flex-col gap-6 border-t border-border pt-6">
          <div className={errorBannerClass} role="alert">
            The private key is generated locally and never leaves your browser, but it still grants full access to
            anything encrypted with the matching public key. Handle it with the same care as any other private key:
            don't paste it somewhere it could be logged or stored insecurely.
          </div>
          <CopyBlock label="Public key" value={publicPem} />
          <CopyBlock label="Private key" value={privatePem} />
        </div>
      )}
    </div>
  );
}
