import { loadSpec, optionalText, requireText } from "./specYaml.mjs";

/**
 * @typedef {{ kind: "check" } | { kind: "none" } | { kind: "limited", text: string } | { kind: "text", text: string }} MatrixCell
 * @typedef {{ icon: string, label: string, cells: MatrixCell[] }} MatrixRow
 * @typedef {{ columns: string[], rows: MatrixRow[], legend: { check: string, none: string }, notes: Record<string, string> }} MatrixSpec
 * @typedef {{ kind: "check", text: string } | { kind: "none", text: string } | { kind: "note", text: string, note: string }} LegendItem
 */

const MAX_COLUMNS = 8;
const MAX_ROWS = 12;

/** @param {string} source @returns {MatrixSpec} */
export function normalizeMatrixSpec(source) {
  const record = loadSpec(source, "matrix");
  const columns = readColumns(record.columns);
  const rows = readRows(record.rows, columns.length);
  const legend = readLegend(record.legend);
  const notes = readNotes(record.notes);
  const kinds = new Set(rows.flatMap((row) => row.cells.map((cell) => cell.kind)));
  if (kinds.has("check") && !legend.check) {
    throw new Error("Invalid matrix: legend.check is required when a cell is check");
  }
  if (kinds.has("none") && !legend.none) {
    throw new Error("Invalid matrix: legend.none is required when a cell is none");
  }
  return { columns, rows, legend, notes };
}

/** Legend line, in first-seen order. Words come from the spec, not from a fixed language. @param {MatrixSpec} spec @returns {LegendItem[]} */
export function matrixLegend(spec) {
  /** @type {LegendItem[]} */
  const items = [];
  const has = (/** @type {MatrixCell["kind"]} */ kind) =>
    spec.rows.some((row) => row.cells.some((cell) => cell.kind === kind));

  if (has("check")) items.push({ kind: "check", text: spec.legend.check });

  const seen = new Set();
  for (const row of spec.rows) {
    for (const cell of row.cells) {
      if (cell.kind !== "limited" && cell.kind !== "text") continue;
      if (seen.has(cell.text)) continue;
      seen.add(cell.text);
      const note = spec.notes[cell.text];
      if (note) items.push({ kind: "note", text: cell.text, note });
    }
  }

  if (has("none")) items.push({ kind: "none", text: spec.legend.none });
  return items;
}

/** @param {unknown} value @returns {string[]} */
function readColumns(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_COLUMNS) {
    throw new Error(`Invalid matrix: columns must contain 1 to ${MAX_COLUMNS} entries`);
  }
  return value.map((entry, index) => requireText(entry, `columns[${index}]`, "matrix"));
}

/** @param {unknown} value @param {number} columnCount @returns {MatrixRow[]} */
function readRows(value, columnCount) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_ROWS) {
    throw new Error(`Invalid matrix: rows must contain 1 to ${MAX_ROWS} entries`);
  }
  return value.map((entry, index) => {
    const where = `rows[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Invalid matrix: ${where} must be an object`);
    }
    const record = /** @type {Record<string, unknown>} */ (entry);
    if (!Array.isArray(record.cells) || record.cells.length !== columnCount) {
      throw new Error(`Invalid matrix: ${where}.cells must have one entry per column`);
    }
    return {
      icon: optionalText(record.icon, "matrix"),
      label: requireText(record.label, `${where}.label`, "matrix"),
      cells: record.cells.map((cell, cellIndex) => readCell(cell, `${where}.cells[${cellIndex}]`)),
    };
  });
}

/** @param {unknown} value @param {string} where @returns {MatrixCell} */
function readCell(value, where) {
  if (typeof value === "string" || typeof value === "number") {
    const text = requireText(value, where, "matrix");
    if (text === "check") return { kind: "check" };
    if (text === "none") return { kind: "none" };
    return { kind: "text", text };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = /** @type {Record<string, unknown>} */ (value);
    const keys = Object.keys(record);
    if (keys.length === 1 && keys[0] === "limited") {
      return { kind: "limited", text: requireText(record.limited, `${where}.limited`, "matrix") };
    }
  }
  throw new Error(`Invalid matrix: ${where} must be check, none, { limited: text }, or text`);
}

/** @param {unknown} value @returns {{ check: string, none: string }} */
function readLegend(value) {
  if (value == null || value === "") return { check: "", none: "" };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid matrix: legend must be an object");
  }
  const record = /** @type {Record<string, unknown>} */ (value);
  return {
    check: optionalText(record.check, "matrix"),
    none: optionalText(record.none, "matrix"),
  };
}

/** @param {unknown} value @returns {Record<string, string>} */
function readNotes(value) {
  if (value == null || value === "") return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid matrix: notes must be a map of cell text to a short explanation");
  }
  /** @type {Record<string, string>} */
  const notes = {};
  for (const [key, entry] of Object.entries(value)) {
    const name = key.trim();
    if (!name) throw new Error("Invalid matrix: notes keys must be non-empty");
    notes[name] = requireText(entry, `notes.${name}`, "matrix");
  }
  return notes;
}
