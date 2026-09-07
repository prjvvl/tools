import { useMemo, useState } from "react";
import { errorBannerClass } from "../../lib/styles";

const TIME_CLAIMS = ["iat", "nbf", "exp"] as const;

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

interface Decoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

function decodeJwt(token: string): Decoded {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: expected 3 segments separated by '.'.");
  }

  const [headerSeg, payloadSeg] = parts;
  let header: unknown;
  let payload: unknown;

  try {
    header = JSON.parse(base64UrlDecode(headerSeg));
  } catch {
    throw new Error("Could not decode the header: not valid base64url JSON.");
  }
  try {
    payload = JSON.parse(base64UrlDecode(payloadSeg));
  } catch {
    throw new Error("Could not decode the payload: not valid base64url JSON.");
  }

  if (typeof header !== "object" || header === null || typeof payload !== "object" || payload === null) {
    throw new Error("Decoded header or payload is not a JSON object.");
  }

  return { header: header as Record<string, unknown>, payload: payload as Record<string, unknown> };
}

function formatClaim(value: number): string {
  return new Date(value * 1000).toLocaleString();
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { data: decodeJwt(token), error: null as string | null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Could not decode this token." };
    }
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="jwt-input" className="block text-sm font-medium text-fg">
        JWT
      </label>
      <textarea
        id="jwt-input"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="eyJhbGciOi..."
        rows={4}
        spellCheck={false}
        className="mt-2 w-full rounded-card border border-border bg-bg p-3 font-mono text-xs text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />
      <p className="mt-2 text-xs text-fg-muted">
        Decodes the header and payload only. It does not verify the signature, since that needs the secret or
        public key, which never leaves your server.
      </p>

      {result?.error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {result.error}
        </div>
      )}

      {result?.data &&
        (() => {
          const { header, payload } = result.data;
          const timeClaims = TIME_CLAIMS.filter((key) => typeof payload[key] === "number");

          return (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold text-fg">Header</h2>
                  <pre className="mt-2 overflow-x-auto rounded-card border border-border bg-bg p-4 font-mono text-xs text-fg">
                    {JSON.stringify(header, null, 2)}
                  </pre>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-fg">Payload</h2>
                  <pre className="mt-2 overflow-x-auto rounded-card border border-border bg-bg p-4 font-mono text-xs text-fg">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              </div>

              {timeClaims.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {timeClaims.map((key) => {
                    const value = payload[key] as number;
                    const isExpired = key === "exp" && value * 1000 < Date.now();
                    return (
                      <div
                        key={key}
                        className={`rounded-card border px-3 py-2 ${
                          isExpired ? "border-error bg-error-bg text-error" : "border-border bg-bg text-fg-muted"
                        }`}
                      >
                        <span className="font-medium">{key}</span>: {formatClaim(value)}
                        {isExpired && " · expired"}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
    </div>
  );
}
