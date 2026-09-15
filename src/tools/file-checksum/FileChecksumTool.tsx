import { useCallback, useEffect, useRef, useState } from "react";
import { createMD5, createSHA1, createSHA256, createSHA384, createSHA512, type IHasher } from "hash-wasm";
import CopyField from "../../components/CopyField";
import Select from "../../components/Select";
import { errorBannerClass } from "../../lib/styles";

const ALGORITHMS = [
  { value: "MD5", label: "MD5" },
  { value: "SHA-1", label: "SHA-1" },
  { value: "SHA-256", label: "SHA-256" },
  { value: "SHA-384", label: "SHA-384" },
  { value: "SHA-512", label: "SHA-512" },
] as const;

type Algorithm = (typeof ALGORITHMS)[number]["value"];

const HASHER_FACTORY: Record<Algorithm, () => Promise<IHasher>> = {
  MD5: createMD5,
  "SHA-1": createSHA1,
  "SHA-256": createSHA256,
  "SHA-384": createSHA384,
  "SHA-512": createSHA512,
};

const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex++;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function FileChecksumTool() {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [digest, setDigest] = useState("");
  const [progress, setProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expected, setExpected] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Guards against a stale async hash run (e.g. algorithm changed mid-hash)
  // from overwriting a newer one's state.
  const runIdRef = useRef(0);

  const runHash = useCallback(async (targetFile: File, targetAlgorithm: Algorithm) => {
    const runId = ++runIdRef.current;
    setIsHashing(true);
    setError(null);
    setDigest("");
    setProgress(0);

    try {
      const hasher = await HASHER_FACTORY[targetAlgorithm]();
      hasher.init();

      for (let offset = 0; offset < targetFile.size; offset += CHUNK_SIZE) {
        if (runIdRef.current !== runId) return; // superseded by a newer run
        const chunk = targetFile.slice(offset, offset + CHUNK_SIZE);
        const buffer = await chunk.arrayBuffer();
        hasher.update(new Uint8Array(buffer));
        setProgress((offset + buffer.byteLength) / Math.max(targetFile.size, 1));
      }

      if (targetFile.size === 0) setProgress(1);

      if (runIdRef.current !== runId) return;
      const hex = hasher.digest("hex");
      setDigest(hex);
      setProgress(1);
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setError(err instanceof Error ? err.message : "Failed to hash file.");
    } finally {
      if (runIdRef.current === runId) setIsHashing(false);
    }
  }, []);

  function handleFile(next: File) {
    setFile(next);
    void runHash(next, algorithm);
  }

  // Re-run automatically when the algorithm changes for the same file.
  useEffect(() => {
    if (file) void runHash(file, algorithm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  const trimmedExpected = expected.trim().toLowerCase();
  const matches = digest && trimmedExpected ? digest.toLowerCase() === trimmedExpected : null;

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="checksum-file-input" className="block text-sm font-medium text-fg">
        File
      </label>
      <label
        htmlFor="checksum-file-input"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFile(dropped);
        }}
        className={`mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed p-6 text-center transition-colors duration-200 ${
          isDragging ? "border-brand bg-bg" : "border-border bg-bg hover:border-brand-300"
        }`}
      >
        <span className="text-sm font-medium text-fg">
          {file ? file.name : "Drop a file here, or click to choose one"}
        </span>
        {file && <span className="text-xs text-fg-muted">{formatBytes(file.size)}</span>}
        {!file && <span className="text-xs text-fg-muted">Processed entirely in your browser. Nothing is uploaded.</span>}
      </label>
      <input
        id="checksum-file-input"
        type="file"
        className="hidden"
        onChange={(e) => {
          const chosen = e.target.files?.[0];
          if (chosen) handleFile(chosen);
          e.target.value = "";
        }}
      />

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="checksum-algorithm" className="text-sm text-fg-muted">
          Algorithm
        </label>
        <Select
          id="checksum-algorithm"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo.value} value={algo.value}>
              {algo.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <div className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </div>
      )}

      {isHashing && (
        <div className="mt-6" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>Hashing...</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-card bg-bg">
            <div
              className="h-full bg-brand transition-[width] duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {!file && !isHashing && (
        <p className="mt-6 text-sm text-fg-muted">Your file's checksum will appear here once you choose a file.</p>
      )}

      {digest && !isHashing && (
        <div className="mt-6 border-t border-border pt-6" aria-live="polite">
          <p className="mb-2 text-sm font-medium text-fg">{algorithm} digest</p>
          <CopyField value={digest} />

          <label htmlFor="checksum-expected" className="mt-4 block text-sm font-medium text-fg">
            Expected checksum (optional)
          </label>
          <input
            id="checksum-expected"
            type="text"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="Paste a checksum to compare against"
            spellCheck={false}
            className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
          />

          {matches !== null && (
            <p className={`mt-2 text-sm font-medium ${matches ? "text-success" : "text-error"}`} role="status">
              {matches ? "Match" : "Does not match"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
