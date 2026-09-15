import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";
import Select from "../../components/Select";
import CopyField from "../../components/CopyField";

const CHARSETS = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  hex: "0123456789abcdef",
  base64url: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  symbols: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

type CharsetKey = keyof typeof CHARSETS;

const CHARSET_LABELS: Record<CharsetKey, string> = {
  alphanumeric: "Alphanumeric",
  hex: "Hex",
  base64url: "Base64url-safe",
  symbols: "Alphanumeric + Symbols",
};

/** Uses crypto.getRandomValues, never Math.random: this generates real tokens. */
function generateToken(length: number, charsetKey: CharsetKey): string {
  const charset = CHARSETS[charsetKey];
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

export default function TokenGeneratorTool() {
  const [length, setLength] = useState(32);
  const [charsetKey, setCharsetKey] = useState<CharsetKey>("alphanumeric");
  const [token, setToken] = useState("");

  function handleGenerate() {
    setToken(generateToken(length, charsetKey));
  }

  return (
    <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="token-length" className="flex items-center justify-between text-sm font-medium text-fg">
        Length
        <span className="text-fg-muted">{length}</span>
      </label>
      <input
        id="token-length"
        type="range"
        min={8}
        max={128}
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="mt-2 h-2 w-full accent-[var(--color-brand)]"
      />

      <div className="mt-4">
        <label htmlFor="token-charset" className="block text-sm font-medium text-fg">
          Character set
        </label>
        <Select
          id="token-charset"
          className="mt-2 w-full"
          value={charsetKey}
          onChange={(e) => setCharsetKey(e.target.value as CharsetKey)}
        >
          {(Object.keys(CHARSETS) as CharsetKey[]).map((key) => (
            <option key={key} value={key}>
              {CHARSET_LABELS[key]}
            </option>
          ))}
        </Select>
      </div>

      <button type="button" onClick={handleGenerate} className={`mt-4 w-full ${buttonVariantClass.primary}`}>
        Generate
      </button>

      {!token && <p className="mt-6 text-sm text-fg-muted">Your generated token will appear here.</p>}

      {token && (
        <div className="mt-6 border-t border-border pt-6">
          <CopyField value={token} />
        </div>
      )}
    </div>
  );
}
