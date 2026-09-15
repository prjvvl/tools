import { useMemo, useState } from "react";

// A small sample of extremely common passwords/patterns, not an exhaustive
// breach list: this is a heuristic nudge, not a real-world credential check.
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "abc123",
  "iloveyou",
  "football",
  "111111",
  "123123",
  "password1",
  "1234567",
  "sunshine",
  "princess",
  "qwerty123",
];

interface Level {
  label: string;
  colorClass: string;
  barClass: string;
  percent: number;
}

const LEVELS: Level[] = [
  { label: "Very Weak", colorClass: "text-error", barClass: "bg-error", percent: 20 },
  { label: "Weak", colorClass: "text-error", barClass: "bg-error", percent: 40 },
  { label: "Fair", colorClass: "text-warning", barClass: "bg-warning", percent: 60 },
  { label: "Strong", colorClass: "text-success", barClass: "bg-success", percent: 80 },
  { label: "Very Strong", colorClass: "text-success", barClass: "bg-success", percent: 100 },
];

interface Analysis {
  entropyBits: number;
  level: Level;
  suggestions: string[];
}

function analyze(password: string): Analysis {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;

  const entropyBits = password.length > 0 ? password.length * Math.log2(Math.max(charsetSize, 1)) : 0;

  const lower = password.toLowerCase();
  const isCommon = COMMON_PASSWORDS.some((common) => lower === common || lower.includes(common));

  let levelIndex: number;
  if (password.length === 0) {
    levelIndex = 0;
  } else if (isCommon) {
    levelIndex = 0;
  } else if (entropyBits < 28) {
    levelIndex = 0;
  } else if (entropyBits < 40) {
    levelIndex = 1;
  } else if (entropyBits < 60) {
    levelIndex = 2;
  } else if (entropyBits < 80) {
    levelIndex = 3;
  } else {
    levelIndex = 4;
  }

  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push("Use at least 12 characters.");
  if (!hasLower) suggestions.push("Add lowercase letters.");
  if (!hasUpper) suggestions.push("Add uppercase letters.");
  if (!hasDigit) suggestions.push("Add numbers.");
  if (!hasSymbol) suggestions.push("Add symbols (e.g. !@#$%).");
  if (isCommon) suggestions.push("This is a very common password or contains one; avoid it entirely.");
  if (/(.)\1{2,}/.test(password)) suggestions.push("Avoid repeating the same character three or more times in a row.");

  return { entropyBits, level: LEVELS[levelIndex], suggestions };
}

export default function PasswordStrengthTool() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const analysis = useMemo(() => analyze(password), [password]);

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="password-strength-input" className="block text-sm font-medium text-fg">
        Password
      </label>
      <div className="relative mt-2">
        <input
          id="password-strength-input"
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type a password to analyze..."
          spellCheck={false}
          autoComplete="off"
          className="min-h-11 w-full rounded-card border border-border bg-bg px-3 pr-16 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-card px-2 py-1 text-xs text-fg-muted hover:text-fg"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {password.length > 0 && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-fg-muted">Strength</span>
            <span className={analysis.level.colorClass}>{analysis.level.label}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-card bg-border">
            <div
              className={`h-full ${analysis.level.barClass} transition-all duration-200`}
              style={{ width: `${analysis.level.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-fg-muted">
            Estimated entropy: ~{Math.round(analysis.entropyBits)} bits (a heuristic based on length and detected
            character types, not a real attack-cost estimate).
          </p>

          {analysis.suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-fg">Suggestions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
                {analysis.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
