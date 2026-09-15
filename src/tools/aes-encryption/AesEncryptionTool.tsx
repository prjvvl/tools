import { useState } from "react";
import { buttonVariantClass, errorBannerClass, pillClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";

type Mode = "encrypt" | "decrypt";

const PBKDF2_ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${bytesToBase64(salt)}.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

async function decrypt(payload: string, passphrase: string): Promise<string> {
  const parts = payload.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed input: expected salt.iv.ciphertext.");
  }
  const [saltB64, ivB64, ciphertextB64] = parts;
  const salt = base64ToBytes(saltB64);
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ciphertextB64);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ciphertext as BufferSource);
  return new TextDecoder().decode(plaintext);
}

export default function AesEncryptionTool() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [input, setInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const subtleAvailable = typeof crypto !== "undefined" && Boolean(crypto.subtle);

  function switchMode(next: Mode) {
    setMode(next);
    setInput("");
    setOutput("");
    setError(null);
  }

  async function handleRun() {
    if (!input || !passphrase) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const result = mode === "encrypt" ? await encrypt(input, passphrase) : await decrypt(input, passphrase);
      setOutput(result);
    } catch {
      setError(
        mode === "encrypt"
          ? "Encryption failed. Please try again."
          : "Decryption failed. Check your passphrase and that the input wasn't modified.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write can fail silently (permissions); nothing else to do
    }
  }

  if (!subtleAvailable) {
    return (
      <div className={`mx-auto max-w-2xl ${errorBannerClass}`} role="alert">
        AES encryption needs the Web Crypto API, only available in a secure context (HTTPS or localhost).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex gap-2" role="tablist" aria-label="Mode">
        <button type="button" role="tab" aria-selected={mode === "encrypt"} onClick={() => switchMode("encrypt")} className={pillClass(mode === "encrypt")}>
          Encrypt
        </button>
        <button type="button" role="tab" aria-selected={mode === "decrypt"} onClick={() => switchMode("decrypt")} className={pillClass(mode === "decrypt")}>
          Decrypt
        </button>
      </div>

      <label htmlFor="aes-input" className="mt-4 block text-sm font-medium text-fg">
        {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
      </label>
      <textarea
        id="aes-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encrypt" ? "Type or paste text to encrypt..." : "salt.iv.ciphertext"}
        rows={6}
        spellCheck={false}
        className="mt-2 w-full rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <label htmlFor="aes-passphrase" className="mt-4 block text-sm font-medium text-fg">
        Passphrase
      </label>
      <input
        id="aes-passphrase"
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Shared passphrase..."
        className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleRun}
        disabled={loading || !input || !passphrase}
        className={`mt-4 w-full ${buttonVariantClass.primary} disabled:opacity-50`}
      >
        {loading ? (mode === "encrypt" ? "Encrypting..." : "Decrypting...") : mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </button>

      <p className="mt-3 text-xs text-fg-muted">
        Uses AES-GCM-256 with a PBKDF2-derived key (100,000 iterations, random salt and IV per encryption). All work
        happens locally in your browser; nothing is sent anywhere.
      </p>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {!output && !error && (
        <p className="mt-6 text-sm text-fg-muted">
          {mode === "encrypt" ? "Your encrypted output will appear here." : "Your decrypted output will appear here."}
        </p>
      )}

      {output && mode === "encrypt" && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium text-fg">Encrypted (salt.iv.ciphertext, base64)</p>
          <CopyField value={output} />
        </div>
      )}

      {output && mode === "decrypt" && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Decrypted plaintext</p>
            <button type="button" onClick={handleCopyOutput} className={buttonVariantClass.secondary}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-card border border-border bg-bg p-4 font-mono text-sm whitespace-pre-wrap text-fg" aria-live="polite">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
