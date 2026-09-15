import { useState } from "react";
import { buttonVariantClass } from "../../lib/styles";

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Encodes a non-negative integer (the 48-bit timestamp) as Crockford
 * base32, left-padded to the given number of characters.
 */
function encodeTimestamp(time: number, length: number): string {
  let value = time;
  let out = "";
  for (let i = 0; i < length; i++) {
    out = CROCKFORD_ALPHABET[value % 32] + out;
    value = Math.floor(value / 32);
  }
  return out;
}

/**
 * Encodes random bytes as Crockford base32 by consuming 5 bits at a time
 * across the byte stream, producing exactly `length` characters from
 * `length * 5` bits of randomness.
 */
function encodeRandom(bytes: Uint8Array, length: number): string {
  let bitBuffer = 0;
  let bitCount = 0;
  let byteIndex = 0;
  let out = "";

  for (let i = 0; i < length; i++) {
    while (bitCount < 5 && byteIndex < bytes.length) {
      bitBuffer = (bitBuffer << 8) | bytes[byteIndex++];
      bitCount += 8;
    }
    const shift = bitCount - 5;
    const index = (bitBuffer >> shift) & 0x1f;
    bitBuffer &= (1 << shift) - 1;
    bitCount -= 5;
    out += CROCKFORD_ALPHABET[index];
  }
  return out;
}

/**
 * Hand-rolled ULID: 48-bit timestamp (10 Crockford base32 chars) followed
 * by 80 bits of crypto-random Crockford base32 (16 chars) = 26 chars total.
 * No dependency, since crypto.getRandomValues is all this needs.
 */
function generateUlid(): string {
  const timePart = encodeTimestamp(Date.now(), 10);
  const randomBytes = new Uint8Array(10); // 80 bits
  crypto.getRandomValues(randomBytes);
  const randomPart = encodeRandom(randomBytes, 16);
  return timePart + randomPart;
}

type CopyStatus = "copied" | "failed";

export default function UlidGeneratorTool() {
  const [count, setCount] = useState(1);
  const [ulids, setUlids] = useState<string[]>([]);
  const [rowStatus, setRowStatus] = useState<{ index: number; status: CopyStatus } | null>(null);
  const [allStatus, setAllStatus] = useState<CopyStatus | null>(null);

  function handleGenerate() {
    setUlids(Array.from({ length: count }, () => generateUlid()));
    setRowStatus(null);
    setAllStatus(null);
  }

  async function handleCopyOne(id: string, index: number) {
    try {
      await navigator.clipboard.writeText(id);
      setRowStatus({ index, status: "copied" });
    } catch {
      setRowStatus({ index, status: "failed" });
    }
    setTimeout(() => setRowStatus((current) => (current?.index === index ? null : current)), 1500);
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(ulids.join("\n"));
      setAllStatus("copied");
    } catch {
      setAllStatus("failed");
    }
    setTimeout(() => setAllStatus(null), 1500);
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="ulid-count" className="block text-sm font-medium text-fg">
            How many?
          </label>
          <input
            id="ulid-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(clamp(Number(e.target.value) || 1, 1, 50))}
            className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
          />
        </div>
        <button type="button" onClick={handleGenerate} className={buttonVariantClass.primary}>
          Generate
        </button>
      </div>

      {ulids.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">Generated ULIDs will appear here.</p>
      ) : (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-fg-muted">{ulids.length} generated</p>
            <button type="button" onClick={handleCopyAll} className={buttonVariantClass.secondary}>
              {allStatus === "copied" ? "Copied!" : allStatus === "failed" ? "Copy failed" : "Copy All"}
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
            {ulids.map((id, index) => (
              <li
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-bg px-3 py-2"
              >
                <code className="truncate font-mono text-sm text-fg">{id}</code>
                <button type="button" onClick={() => handleCopyOne(id, index)} className={buttonVariantClass.ghost}>
                  {rowStatus?.index === index
                    ? rowStatus.status === "copied"
                      ? "Copied"
                      : "Failed"
                    : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
