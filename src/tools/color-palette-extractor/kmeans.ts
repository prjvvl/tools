/**
 * A small k-means implementation in RGB space, used to extract a dominant
 * color palette from an image's pixel buffer. Deliberately a real clustering
 * pass (not a "most frequent exact value" histogram): a histogram of exact
 * RGB triples produces noisy/banded results on photos because near-identical
 * pixels rarely share an exact value, while k-means groups nearby colors
 * together the way a human would when naming "the palette" of an image.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteEntry extends RgbColor {
  /** Fraction (0-1) of clustered pixels assigned to this color. */
  weight: number;
}

const MAX_ITERATIONS = 15;
/** Centroid movement (in RGB units) below which we consider k-means converged. */
const CONVERGENCE_THRESHOLD = 1;

function squaredDistance(a: RgbColor, b: RgbColor): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Pick k initial centroids by sampling evenly-spaced pixels from the opaque
 * pixel list. Evenly-spaced (rather than random) sampling keeps results
 * deterministic run-to-run for the same image, which makes the tool feel
 * predictable rather than shuffling the palette on every click.
 */
function pickInitialCentroids(pixels: RgbColor[], k: number): RgbColor[] {
  const centroids: RgbColor[] = [];
  const step = pixels.length / k;
  for (let i = 0; i < k; i++) {
    const idx = Math.min(pixels.length - 1, Math.floor(i * step + step / 2));
    const p = pixels[idx];
    centroids.push({ r: p.r, g: p.g, b: p.b });
  }
  return centroids;
}

/**
 * Cluster `pixels` into `k` groups by color similarity and return the
 * resulting centroids sorted by cluster size, largest (most dominant) first.
 */
export function extractPalette(pixels: RgbColor[], k: number): PaletteEntry[] {
  if (pixels.length === 0) return [];

  const clampedK = Math.max(1, Math.min(k, pixels.length));
  let centroids = pickInitialCentroids(pixels, clampedK);
  const assignments = new Int32Array(pixels.length);

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // Assignment step: nearest centroid for every pixel.
    for (let i = 0; i < pixels.length; i++) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredDistance(pixels[i], centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      assignments[i] = bestIdx;
    }

    // Update step: recompute each centroid as the mean of its members.
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (let i = 0; i < pixels.length; i++) {
      const s = sums[assignments[i]];
      s.r += pixels[i].r;
      s.g += pixels[i].g;
      s.b += pixels[i].b;
      s.count++;
    }

    let maxMove = 0;
    const nextCentroids: RgbColor[] = centroids.map((prev, c) => {
      const s = sums[c];
      if (s.count === 0) {
        // Empty cluster: keep its previous position rather than reseeding,
        // it simply won't contribute to the final palette (weight 0).
        return prev;
      }
      const next = { r: s.r / s.count, g: s.g / s.count, b: s.b / s.count };
      maxMove = Math.max(maxMove, Math.sqrt(squaredDistance(prev, next)));
      return next;
    });

    centroids = nextCentroids;
    if (maxMove < CONVERGENCE_THRESHOLD) break;
  }

  const counts = new Array(centroids.length).fill(0);
  for (let i = 0; i < pixels.length; i++) counts[assignments[i]]++;

  return centroids
    .map((c, i) => ({
      r: Math.round(c.r),
      g: Math.round(c.g),
      b: Math.round(c.b),
      weight: counts[i] / pixels.length,
    }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function rgbToCss({ r, g, b }: RgbColor): string {
  return `rgb(${r}, ${g}, ${b})`;
}
