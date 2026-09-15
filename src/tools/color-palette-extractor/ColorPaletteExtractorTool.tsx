import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import CopyField from "../../components/CopyField";
import { extractPalette, rgbToCss, rgbToHex, type PaletteEntry } from "./kmeans";

interface Dims {
  width: number;
  height: number;
}

/** Longest edge (in px) the image is downscaled to before clustering.
 * Clustering doesn't need full resolution, and capping this keeps the
 * algorithm fast even for large photos. */
const CLUSTER_MAX_EDGE = 200;
const MIN_COLORS = 3;
const MAX_COLORS = 10;
const DEFAULT_COLORS = 6;
/** Alpha (0-255) below which a pixel is treated as fully transparent and
 * skipped, so a transparent border doesn't pollute the palette. */
const ALPHA_SKIP_THRESHOLD = 10;

function buildCssVariables(palette: PaletteEntry[]): string {
  const lines = palette.map((entry, i) => `  --palette-${i + 1}: ${rgbToHex(entry)};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export default function ColorPaletteExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<Dims | null>(null);
  const [colorCount, setColorCount] = useState(DEFAULT_COLORS);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteEntry[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceUrlRef = useRef<string | null>(null);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  // Revoke whichever object URL is live when the component unmounts.
  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    };
  }, []);

  function loadFile(picked: File) {
    if (!picked.type.startsWith("image/")) {
      setError("That file doesn't look like an image. Choose a PNG, JPEG, WebP, or similar.");
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setError(null);
    setPalette(null);
    setSourceDims(null);
    setFile(picked);
    setSourceUrl(URL.createObjectURL(picked));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    loadFile(picked);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) loadFile(dropped);
  }

  function handleExtract() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !sourceDims) return;

    setExtracting(true);
    setError(null);

    const scale = Math.min(1, CLUSTER_MAX_EDGE / Math.max(sourceDims.width, sourceDims.height));
    const width = Math.max(1, Math.round(sourceDims.width * scale));
    const height = Math.max(1, Math.round(sourceDims.height * scale));
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not get a canvas context in this browser.");
      setExtracting(false);
      return;
    }

    try {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const { data } = ctx.getImageData(0, 0, width, height);

      const pixels: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < ALPHA_SKIP_THRESHOLD) continue;
        pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }

      if (pixels.length === 0) {
        setError("This image is fully transparent, so no colors could be extracted.");
        setExtracting(false);
        return;
      }

      const result = extractPalette(pixels, colorCount);
      setPalette(result);
    } catch {
      setError("Could not read this image's pixel data. Try a different file.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleCopyAll() {
    if (!palette) return;
    try {
      await navigator.clipboard.writeText(buildCssVariables(palette));
      setCopiedAll(true);
    } catch {
      setCopiedAll(false);
    }
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="cpe-file" className="block text-sm font-medium text-fg">
        Image file
      </label>
      <label
        htmlFor="cpe-file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed px-3 py-4 text-center text-sm text-fg-muted hover-elevate ${
          dragActive ? "border-brand-300 bg-bg" : "border-border bg-bg"
        }`}
      >
        <Upload className="size-5" aria-hidden="true" />
        {file ? file.name : "Choose an image or drag and drop it here"}
      </label>
      <input id="cpe-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="mt-6">
        <label htmlFor="cpe-count" className="block text-sm font-medium text-fg">
          Number of colors ({colorCount})
        </label>
        <input
          id="cpe-count"
          type="range"
          min={MIN_COLORS}
          max={MAX_COLORS}
          step={1}
          value={colorCount}
          onChange={(e) => setColorCount(Number(e.target.value))}
          className="mt-4 w-full accent-brand"
        />
      </div>

      <button
        type="button"
        onClick={handleExtract}
        disabled={!sourceDims || extracting}
        className={`mt-6 ${buttonVariantClass.primary} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {extracting ? "Extracting..." : "Extract palette"}
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
          onError={() => setError("This browser could not load that image. Try a different file.")}
        />
      )}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 border-t border-border pt-6" aria-live="polite">
        {!palette && (
          <p className="text-sm text-fg-muted">
            {sourceDims
              ? "Click Extract palette to see the dominant colors here."
              : "Choose an image and click Extract palette to see the dominant colors here."}
          </p>
        )}

        {palette && sourceUrl && sourceDims && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-fg">Source image</p>
              <img
                src={sourceUrl}
                alt="Uploaded preview"
                width={sourceDims.width}
                height={sourceDims.height}
                className="max-h-48 w-full rounded-card border border-border bg-bg object-contain"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-fg">Palette (most dominant first)</p>
                <button type="button" onClick={handleCopyAll} className={buttonVariantClass.secondary}>
                  {copiedAll ? "Copied!" : "Copy all as CSS variables"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {palette.map((entry, i) => (
                  <div key={i} className="rounded-card border border-border bg-bg p-3">
                    <div
                      className="h-16 w-full rounded-card border border-border"
                      style={{ backgroundColor: rgbToCss(entry) }}
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs text-fg-muted">{Math.round(entry.weight * 100)}% of image</p>
                    <div className="mt-2">
                      <CopyField value={rgbToHex(entry)} />
                    </div>
                    <div className="mt-2">
                      <CopyField value={rgbToCss(entry)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-fg">CSS variables</p>
              <pre className="overflow-x-auto rounded-card border border-border bg-bg px-3 py-2 font-mono text-sm text-fg">
                {buildCssVariables(palette)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
