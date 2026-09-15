import { useEffect, useState } from "react";
import { errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";

const DEFAULT_HEADER = `{"alg":"HS256","typ":"JWT"}`;
const DEFAULT_PAYLOAD = `{"sub":"1234567890","name":"John Doe","iat":1516239022}`;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncode(new TextEncoder().encode(value));
}

export default function JwtEncoderTool() {
  const [headerJson, setHeaderJson] = useState(DEFAULT_HEADER);
  const [payloadJson, setPayloadJson] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("");
  const [jwt, setJwt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtleAvailable = typeof crypto !== "undefined" && Boolean(crypto.subtle);

  // Same guarded-async pattern as hmac-generator/hash-generator: JSON
  // parsing is sync, but the HMAC signature is computed via crypto.subtle,
  // which is async. The `cancelled` flag stops a stale signature (from an
  // edit that's since been superseded) from overwriting a newer one.
  useEffect(() => {
    if (!subtleAvailable) {
      setJwt("");
      return;
    }

    let header: unknown;
    let payload: unknown;
    try {
      header = JSON.parse(headerJson);
    } catch {
      setJwt("");
      setError("Header is not valid JSON.");
      return;
    }
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      setJwt("");
      setError("Payload is not valid JSON.");
      return;
    }
    if (typeof header !== "object" || header === null || typeof payload !== "object" || payload === null) {
      setJwt("");
      setError("Header and payload must both be JSON objects.");
      return;
    }
    if (!secret) {
      setJwt("");
      setError(null);
      return;
    }

    setError(null);
    let cancelled = false;

    (async () => {
      try {
        const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
        const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
        const signingInput = `${encodedHeader}.${encodedPayload}`;

        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(signingInput));
        const encodedSignature = base64UrlEncode(new Uint8Array(signature));

        if (!cancelled) {
          setJwt(`${signingInput}.${encodedSignature}`);
        }
      } catch {
        if (!cancelled) {
          setJwt("");
          setError("Could not sign the token.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [headerJson, payloadJson, secret, subtleAvailable]);

  if (!subtleAvailable) {
    return (
      <div className={`mx-auto max-w-2xl ${errorBannerClass}`} role="alert">
        Signing needs the Web Crypto API, only available in a secure context (HTTPS or localhost).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jwt-header" className="block text-sm font-medium text-fg">
            Header JSON
          </label>
          <textarea
            id="jwt-header"
            value={headerJson}
            onChange={(e) => setHeaderJson(e.target.value)}
            rows={6}
            spellCheck={false}
            className="mt-2 w-full rounded-card border border-border bg-bg p-3 font-mono text-xs text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="jwt-payload" className="block text-sm font-medium text-fg">
            Payload JSON
          </label>
          <textarea
            id="jwt-payload"
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            rows={6}
            spellCheck={false}
            className="mt-2 w-full rounded-card border border-border bg-bg p-3 font-mono text-xs text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>
      </div>

      <label htmlFor="jwt-secret" className="mt-4 block text-sm font-medium text-fg">
        Secret
      </label>
      <input
        id="jwt-secret"
        type="text"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="HS256 signing secret..."
        className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {!jwt && !error && (
        <p className="mt-6 text-sm text-fg-muted">Enter a secret to sign and produce a JWT.</p>
      )}

      {jwt && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium text-fg">Signed JWT (HS256)</p>
          <CopyField value={jwt} />
        </div>
      )}
    </div>
  );
}
