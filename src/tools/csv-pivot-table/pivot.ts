export type AggregateFn = "sum" | "average" | "count" | "min" | "max";

export const AGGREGATE_OPTIONS: { value: AggregateFn; label: string }[] = [
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "count", label: "Count" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
];

interface GroupAccumulator {
  keyValues: string[];
  rowCount: number;
  sum: number;
  min: number;
  max: number;
  numericCount: number;
}

export interface PivotResult {
  headers: string[];
  rows: (string | number)[][];
  /** Non-numeric (or blank) values in the value column that were ignored. */
  skippedCount: number;
}

/**
 * Groups `rows` by the given `groupByCols` (column names, in order) and
 * aggregates `valueCol` with `aggFn`. "count" ignores the value column
 * entirely and just counts rows per group; the numeric aggregates (sum,
 * average, min, max) skip non-numeric/blank values rather than throwing,
 * and the caller is told how many were skipped so it can surface a note.
 */
export function computePivot(
  headers: string[],
  rows: string[][],
  groupByCols: string[],
  valueCol: string,
  aggFn: AggregateFn,
): PivotResult {
  const groupIdx = groupByCols.map((col) => headers.indexOf(col));
  const valueIdx = headers.indexOf(valueCol);

  const groups = new Map<string, GroupAccumulator>();
  let skippedCount = 0;

  for (const row of rows) {
    const keyValues = groupIdx.map((i) => row[i] ?? "");
    const key = JSON.stringify(keyValues);

    let acc = groups.get(key);
    if (!acc) {
      acc = { keyValues, rowCount: 0, sum: 0, min: Infinity, max: -Infinity, numericCount: 0 };
      groups.set(key, acc);
    }
    acc.rowCount += 1;

    if (aggFn !== "count") {
      const raw = (valueIdx >= 0 ? row[valueIdx] : "").trim();
      const num = raw === "" ? NaN : Number(raw);
      if (Number.isFinite(num)) {
        acc.sum += num;
        acc.min = Math.min(acc.min, num);
        acc.max = Math.max(acc.max, num);
        acc.numericCount += 1;
      } else {
        skippedCount += 1;
      }
    }
  }

  const aggLabel = AGGREGATE_OPTIONS.find((o) => o.value === aggFn)?.label ?? aggFn;
  const resultHeaders = [...groupByCols, `${aggLabel} of ${aggFn === "count" ? "rows" : valueCol}`];

  const resultRows = Array.from(groups.values())
    .sort((a, b) => {
      for (let i = 0; i < a.keyValues.length; i++) {
        const cmp = a.keyValues[i].localeCompare(b.keyValues[i]);
        if (cmp !== 0) return cmp;
      }
      return 0;
    })
    .map((acc) => {
      let value: string | number;
      switch (aggFn) {
        case "count":
          value = acc.rowCount;
          break;
        case "sum":
          value = acc.numericCount > 0 ? acc.sum : 0;
          break;
        case "average":
          value = acc.numericCount > 0 ? acc.sum / acc.numericCount : "—";
          break;
        case "min":
          value = acc.numericCount > 0 ? acc.min : "—";
          break;
        case "max":
          value = acc.numericCount > 0 ? acc.max : "—";
          break;
      }
      if (typeof value === "number" && !Number.isInteger(value)) {
        value = Math.round(value * 1e6) / 1e6;
      }
      return [...acc.keyValues, value];
    });

  return { headers: resultHeaders, rows: resultRows, skippedCount };
}
