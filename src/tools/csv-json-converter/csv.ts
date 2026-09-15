/**
 * Hand-rolled RFC4180-ish CSV parser/serializer. No dependency needed for
 * this: quoted fields (with embedded commas/newlines and doubled `""`
 * escaped quotes) are the only real complexity, and a small state machine
 * covers it directly.
 */

/** Splits raw CSV text into rows of raw string fields. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r" || char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      if (char === "\r" && text[i] === "\n") i++;
      continue;
    }
    field += char;
    i++;
  }

  if (inQuotes) {
    throw new Error("Unterminated quoted field: a \" was opened but never closed.");
  }
  // Only push a trailing row if there's real trailing content, so a file
  // ending in a newline doesn't produce a bogus empty final row.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** First row = headers, every following row becomes one object. */
export function csvToJson(csvText: string): Record<string, string>[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  return dataRows.map((row, idx) => {
    if (row.length !== header.length) {
      throw new Error(
        `Row ${idx + 2} has ${row.length} column(s), but the header row has ${header.length}.`,
      );
    }
    const obj: Record<string, string> = {};
    header.forEach((key, i) => {
      obj[key] = row[i];
    });
    return obj;
  });
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Expects a JSON array of flat objects. Headers come from the first
 * object's own keys (a documented simplifying assumption, not a union
 * across every object) — good enough for the common "array of uniform
 * records" case this tool targets.
 */
export function jsonToCsv(jsonText: string): string {
  const parsed: unknown = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of flat objects.");
  }
  if (parsed.length === 0) return "";

  const first = parsed[0];
  if (typeof first !== "object" || first === null || Array.isArray(first)) {
    throw new Error("Expected a JSON array of flat objects.");
  }
  const headers = Object.keys(first as Record<string, unknown>);

  const lines = [headers.map(csvEscape).join(",")];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error("Every array element must be a flat object.");
    }
    const record = item as Record<string, unknown>;
    lines.push(headers.map((key) => csvEscape(record[key])).join(","));
  }
  return lines.join("\r\n");
}
