import { useMemo, useState } from "react";
import { buttonVariantClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

type OptionKey = keyof typeof CHARSETS;
type Options = Record<OptionKey, boolean>;

const OPTION_LABELS: Record<OptionKey, string> = {
  uppercase: "Uppercase (A-Z)",
  lowercase: "Lowercase (a-z)",
  numbers: "Numbers (0-9)",
  symbols: "Symbols (!@#...)",
};

/**
 * Uses crypto.getRandomValues, not Math.random: this generates real
 * passwords, and Math.random is not cryptographically safe.
 */
function generatePassword(length: number, options: Options): string {
  const charset = (Object.keys(options) as OptionKey[])
    .filter((key) => options[key])
    .map((key) => CHARSETS[key])
    .join("");

  if (!charset) return "";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

function estimateStrength(length: number, options: Options) {
  let charsetSize = 0;
  if (options.uppercase) charsetSize += 26;
  if (options.lowercase) charsetSize += 26;
  if (options.numbers) charsetSize += 10;
  if (options.symbols) charsetSize += 32;

  const entropyBits = length * Math.log2(Math.max(charsetSize, 1));

  if (entropyBits < 40) return { label: "Weak", colorClass: "text-error", barClass: "bg-error", percent: 25 };
  if (entropyBits < 60) return { label: "Fair", colorClass: "text-warning", barClass: "bg-warning", percent: 50 };
  if (entropyBits < 80) return { label: "Strong", colorClass: "text-success", barClass: "bg-success", percent: 75 };
  return { label: "Excellent", colorClass: "text-success", barClass: "bg-success", percent: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<Options>({
    uppercase: false,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");

  const strength = useMemo(() => estimateStrength(length, options), [length, options]);

  function toggleOption(key: OptionKey) {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const anyChecked = Object.values(next).some(Boolean);
      return anyChecked ? next : prev;
    });
  }

  function handleGenerate() {
    setPassword(generatePassword(length, options));
  }

  return (
    <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="password-length" className="flex items-center justify-between text-sm font-medium text-fg">
        Length
        <span className="text-fg-muted">{length}</span>
      </label>
      <input
        id="password-length"
        type="range"
        min={8}
        max={64}
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="mt-2 h-2 w-full accent-[var(--color-brand)]"
      />

      <div className="mt-4 flex flex-col gap-2">
        {(Object.keys(CHARSETS) as OptionKey[]).map((key) => (
          <label key={key} className="flex min-h-11 items-center gap-3 text-sm text-fg">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggleOption(key)}
              className="size-4 accent-[var(--color-brand)]"
            />
            {OPTION_LABELS[key]}
          </label>
        ))}
      </div>

      <button type="button" onClick={handleGenerate} className={`mt-4 w-full ${buttonVariantClass.primary}`}>
        Generate Password
      </button>

      {!password && <p className="mt-6 text-sm text-fg-muted">Your generated password will appear here.</p>}

      {password && (
        <div className="mt-6 border-t border-border pt-6">
          <CopyField value={password} />

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Strength</span>
              <span className={strength.colorClass}>{strength.label}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-card bg-border">
              <div
                className={`h-full ${strength.barClass} transition-all duration-200`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
