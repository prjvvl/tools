/**
 * Lightweight fuzzy match used by the homepage search box and the command
 * palette: every character of `query` must appear in `text`, in order, but
 * not necessarily contiguous. An exact substring match always outranks a
 * scattered one, and consecutive character matches score higher than
 * spread-out ones, so "jsn" still ranks "JSON Formatter" near the top.
 * This is a small, hand-rolled scorer for a few dozen tool names, not a
 * general-purpose search library.
 */
/** Below this length, a scattered subsequence match is too easy to hit by
 * coincidence in a long string (title + description), so short queries only
 * match as a real substring. */
const MIN_QUERY_LENGTH_FOR_SCATTERED_MATCH = 4;

export function fuzzyScore(query: string, text: string): number {
  if (!query) return 0;

  const q = query.toLowerCase();
  const t = text.toLowerCase();

  const substringIndex = t.indexOf(q);
  if (substringIndex !== -1) {
    return 10_000 - substringIndex;
  }

  if (q.length < MIN_QUERY_LENGTH_FOR_SCATTERED_MATCH) return -1;

  let qi = 0;
  let score = 0;
  let lastMatch = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatch === ti - 1 ? 5 : 1;
      lastMatch = ti;
      qi++;
    }
  }

  return qi === q.length ? score : -1;
}

export interface Searchable {
  slug: string;
  title: string;
  description: string;
}

/** Ranks `items` against `query`: title matches always outrank
 * description-only matches, best fuzzy score first. Returns every item,
 * unranked, when `query` is blank. */
export function searchTools<T extends Searchable>(items: readonly T[], query: string): T[] {
  const trimmed = query.trim();
  if (!trimmed) return [...items];

  return items
    .map((item) => {
      const titleScore = fuzzyScore(trimmed, item.title);
      const descScore = fuzzyScore(trimmed, item.description);
      const score = titleScore > -1 ? titleScore + 100_000 : descScore;
      return { item, score };
    })
    .filter(({ score }) => score > -1)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
