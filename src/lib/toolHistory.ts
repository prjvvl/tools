/**
 * Per-visitor favorites/recently-used tool slugs, kept in localStorage only
 * (never sent anywhere, matching the rest of the site). Used by the
 * homepage's Favorites/Recently used sections and by ToolLayout, which
 * records a visit on every tool page load.
 */
const FAVORITES_KEY = "tools:favorites";
const RECENT_KEY = "tools:recent";
const RECENT_LIMIT = 6;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage unavailable (private mode, quota exceeded): favorites/recents
    // just won't persist for this visitor. Not worth surfacing as an error.
  }
}

export function getFavorites(): string[] {
  return readList(FAVORITES_KEY);
}

/** Adds or removes `slug` from favorites. Returns whether it's now favorited. */
export function toggleFavorite(slug: string): boolean {
  const current = getFavorites();
  const index = current.indexOf(slug);
  if (index === -1) {
    current.push(slug);
  } else {
    current.splice(index, 1);
  }
  writeList(FAVORITES_KEY, current);
  return index === -1;
}

export function getRecent(): string[] {
  return readList(RECENT_KEY);
}

export function recordVisit(slug: string) {
  const current = getRecent().filter((s) => s !== slug);
  current.unshift(slug);
  writeList(RECENT_KEY, current.slice(0, RECENT_LIMIT));
}
