import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import Select from "../../components/Select";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";

type Format = "png" | "jpeg" | "webp";

interface FormatDef {
  id: Format;
  label: string;
  mime: string;
  ext: string;
}

const FORMAT_OPTIONS: FormatDef[] = [
  { id: "png", label: "PNG", mime: "image/png", ext: "png" },
  { id: "jpeg", label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  { id: "webp", label: "WebP", mime: "image/webp", ext: "webp" },
];

interface Dims {
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<Dims | null>(null);
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(0.92);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; blob: Blob; dims: Dims } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);
  useEffect(() => {
    resultUrlRef.current = result?.url ?? null;
  }, [result]);

  // Revoke whichever object URLs are live when the component unmounts.
  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (result) URL.revokeObjectURL(result.url);

    setError(null);
    setResult(null);
    setSourceDims(null);
    setFile(picked);
    setSourceUrl(URL.createObjectURL(picked));
  }

  function handleConvert() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !sourceDims) return;

    setConverting(true);
    setError(null);

    const { width, height } = sourceDims;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not get a canvas context in this browser.");
      setConverting(false);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    if (format === "jpeg") {
      // JPEG has no alpha channel; fill white first so transparent pixels
      // don't turn black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    const def = FORMAT_OPTIONS.find((f) => f.id === format)!;

    canvas.toBlob(
      (blob) => {
        setConverting(false);
        if (!blob) {
          setError(`This browser could not encode the image as ${def.label}. Try a different format.`);
          return;
        }
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        setResult({ url: URL.createObjectURL(blob), blob, dims: { width, height } });
      },
      def.mime,
      def.id === "png" ? undefined : quality,
    );
  }

  const def = FORMAT_OPTIONS.find((f) => f.id === format)!;

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="ic-file" className="block text-sm font-medium text-fg">
        Image file
      </label>
      <label
        htmlFor="ic-file"
        className={`mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-bg px-3 py-4 text-center text-sm text-fg-muted hover-elevate`}
      >
        <Upload className="size-5" aria-hidden="true" />
        {file ? file.name : "Choose an image to convert"}
      </label>
      <input id="ic-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ic-format" className="block text-sm font-medium text-fg">
            Target format
          </label>
          <Select
            id="ic-format"
            className="mt-2 w-full"
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
          >
            {FORMAT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>

        {format !== "png" && (
          <div>
            <label htmlFor="ic-quality" className="block text-sm font-medium text-fg">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              id="ic-quality"
              type="range"
              min={0.1}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-4 w-full accent-brand"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleConvert}
        disabled={!sourceDims || converting}
        className={`mt-6 ${buttonVariantClass.primary} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {converting ? "Converting..." : "Convert"}
      </button>

      {error && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </p>
      )}

      {/* Hidden source image used purely as the canvas draw source. */}
      {sourceUrl && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          ref={imgRef}
          src={sourceUrl}
          alt=""
          className="hidden"
          onLoad={(e) => setSourceDims({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
        />
      )}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 border-t border-border pt-6" aria-live="polite">
        {!result && (
          <p className="text-sm text-fg-muted">
            {sourceDims ? "Click Convert to see the result here." : "Choose an image and click Convert to see the result here."}
          </p>
        )}

        {result && file && sourceDims && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-fg">Original</p>
              <img
                src={sourceUrl ?? undefined}
                alt="Original preview"
                width={sourceDims.width}
                height={sourceDims.height}
                className="mt-2 max-h-56 w-full rounded-card border border-border bg-bg object-contain"
              />
              <p className="mt-2 text-sm text-fg-muted">{formatBytes(file.size)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-fg">Converted ({def.label})</p>
              <img
                src={result.url}
                alt="Converted preview"
                width={result.dims.width}
                height={result.dims.height}
                className="mt-2 max-h-56 w-full rounded-card border border-border bg-bg object-contain"
              />
              <p className="mt-2 text-sm text-fg-muted">{formatBytes(result.blob.size)}</p>
              <a
                href={result.url}
                download={`converted.${def.ext}`}
                className={`mt-3 inline-flex ${buttonVariantClass.secondary}`}
              >
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
