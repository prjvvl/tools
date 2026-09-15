import { useState } from "react";
import CopyField from "../../components/CopyField";
import Select from "../../components/Select";
import { errorBannerClass } from "../../lib/styles";

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

const BASES = [
  { value: 2, label: "Binary" },
  { value: 8, label: "Octal" },
  { value: 10, label: "Decimal" },
  { value: 16, label: "Hexadecimal" },
] as const;

/** Unique, order-preserved list of characters in `value` that aren't valid
 * digits for `base` (case-insensitive: hex accepts both `a` and `A`). */
function findInvalidChars(value: string, base: number): string[] {
  const allowed = DIGITS.slice(0, base);
  const invalid: string[] = [];
  for (const char of value) {
    if (!allowed.includes(char.toLowerCase()) && !invalid.includes(char)) {
      invalid.push(char);
    }
  }
  return invalid;
}

function parseToBigInt(value: string, base: number): bigint {
  const bigBase = BigInt(base);
  let result = 0n;
  for (const char of value) {
    result = result * bigBase + BigInt(DIGITS.indexOf(char.toLowerCase()));
  }
  return result;
}

function formatFromBigInt(value: bigint, base: number): string {
  if (value === 0n) return "0";
  const bigBase = BigInt(base);
  let n = value;
  let out = "";
  while (n > 0n) {
    out = DIGITS[Number(n % bigBase)] + out;
    n /= bigBase;
  }
  return out;
}

export default function BaseConverterTool() {
  const [base, setBase] = useState(10);
  const [input, setInput] = useState("");

  const trimmed = input.trim();
  const invalidChars = trimmed ? findInvalidChars(trimmed, base) : [];
  const activeLabel = BASES.find((b) => b.value === base)!.label;

  let error: string | null = null;
  let results: { base: number; label: string; value: string }[] = [];

  if (invalidChars.length > 0) {
    error = `Invalid character${invalidChars.length > 1 ? "s" : ""} for ${activeLabel.toLowerCase()}: ${invalidChars.join(", ")}`;
  } else if (trimmed) {
    const parsed = parseToBigInt(trimmed, base);
    results = BASES.filter((b) => b.value !== base).map((b) => ({
      base: b.value,
      label: b.label,
      value: formatFromBigInt(parsed, b.value),
    }));
  }

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="base-converter-input" className="block text-sm font-medium text-fg">
            Number
          </label>
          <input
            id="base-converter-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a number..."
            spellCheck={false}
            className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="base-converter-base" className="block text-sm font-medium text-fg">
            Base
          </label>
          <div className="mt-2">
            <Select id="base-converter-base" value={base} onChange={(e) => setBase(Number(e.target.value))}>
              {BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} (base {b.value})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r) => (
            <div key={r.base}>
              <span className="block text-sm font-medium text-fg">
                {r.label} (base {r.base})
              </span>
              <div className="mt-2">
                <CopyField value={r.value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
