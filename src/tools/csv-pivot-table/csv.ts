/**
 * Hand-rolled RFC4180-ish CSV parser/serializer, own copy for this tool
 * folder (tools never import across folders — see AGENTS.md). Quoted
 * fields with embedded commas/newlines and doubled `""` escaped quotes are
 * the only real complexity; a small state machine covers it directly.
 */

/** Splits raw CSV text into rows of raw string fields. */
function tokenizeCsv(text: string): string[][] {
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
    throw new Error('Unterminated quoted field: a " was opened but never closed.');
  }
  // Only push a trailing row if there's real trailing content, so a file
  // ending in a newline doesn't produce a bogus empty final row.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export interface ParsedCsvTable {
  headers: string[];
  rows: string[][];
}

/**
 * First row = headers. Validates the shape a pivot needs: at least one
 * data row, no duplicate header names, and every row matching the header's
 * column count.
 */
export function parseCsvTable(text: string): ParsedCsvTable {
  const rawRows = tokenizeCsv(text).filter((r) => !(r.length === 1 && r[0] === ""));
  if (rawRows.length === 0) {
    throw new Error("No rows found. Paste CSV text with a header row and at least one data row.");
  }

  const [headers, ...dataRows] = rawRows;

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const h of headers) {
    if (seen.has(h)) duplicates.add(h);
    seen.add(h);
  }
  if (duplicates.size > 0) {
    throw new Error(`Header row has duplicate column name(s): ${Array.from(duplicates).join(", ")}.`);
  }

  if (dataRows.length === 0) {
    throw new Error("No data rows found. Paste CSV text with a header row and at least one data row.");
  }

  dataRows.forEach((row, idx) => {
    if (row.length !== headers.length) {
      throw new Error(
        `Row ${idx + 2} has ${row.length} column(s), but the header row has ${headers.length}.`,
      );
    }
  });

  return { headers, rows: dataRows };
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serializes a header row + data rows back into CSV text for download. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\r\n");
}
