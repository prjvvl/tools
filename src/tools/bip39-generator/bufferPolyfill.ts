/**
 * Minimal Buffer polyfill so the `bip39` npm package (written for Node) can
 * run in the browser. Astro/Vite don't polyfill Node's `Buffer` global, and
 * bip39's generateMnemonic/entropyToMnemonic path touches `Buffer.isBuffer`
 * and `Buffer.from` internally. Rather than pull in a full "buffer" package
 * dependency, this implements only what that path actually uses:
 * `isBuffer`, `from(bytes)`, and `toString("hex")`. Subclassing Uint8Array
 * means `.length`, indexing, and iteration (used by bip39's own
 * `Array.from(entropy)` / `Uint8Array.from(entropy)` calls) all work for
 * free.
 */
class BufferPolyfill extends Uint8Array {
  static isBuffer(value: unknown): boolean {
    return value instanceof BufferPolyfill;
  }

  // Named `fromBytes`, not `from`: Uint8Array already declares a static
  // `from` (inherited from TypedArray) with overloads this narrower
  // signature can't satisfy, which TS rejects as an incompatible override.
  static fromBytes(data: ArrayLike<number>): BufferPolyfill {
    return new BufferPolyfill(data);
  }

  toString(encoding?: string): string {
    if (encoding === "hex") {
      return Array.from(this)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
    return super.toString();
  }
}

/** Installs the polyfill as `globalThis.Buffer` if nothing has already
 * defined one. Call this before using bip39.
 *
 * Cast through `unknown`: bip39's own type definitions pull in Node's
 * ambient `Buffer: BufferConstructor` global via a `/// <reference
 * types="node" />` directive, so `globalThis.Buffer` type-checks as the
 * real Node `BufferConstructor` here, not our lookalike. This polyfill
 * only needs to satisfy bip39's *runtime* use of `Buffer.isBuffer` /
 * `Buffer.from`, not the full Node type, so the cast is deliberate rather
 * than a shortcut around a real mismatch. */
export function ensureBufferPolyfill(): void {
  const target = globalThis as unknown as { Buffer?: unknown };
  if (typeof target.Buffer === "undefined") {
    target.Buffer = { isBuffer: BufferPolyfill.isBuffer, from: BufferPolyfill.fromBytes };
  }
}
