import yaml from "js-yaml";

/** @param {unknown} source @param {string} kind */
export function loadSpec(source, kind) {
  const text = String(source ?? "").trim();
  if (!text) {
    throw new Error(`Invalid ${kind}: spec is empty`);
  }

  let data;
  try {
    data = text.startsWith("{") ? JSON.parse(text) : yaml.load(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid ${kind}: ${message}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Invalid ${kind}: spec must be a YAML or JSON object`);
  }

  return /** @type {Record<string, unknown>} */ (data);
}

/** @param {unknown} value */
export function coerceText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** @param {unknown} value @param {string} where @param {string} kind */
export function requireText(value, where, kind) {
  const text = coerceText(value);
  if (!text) {
    throw new Error(`Invalid ${kind}: ${where} must be a non-empty string`);
  }
  return text;
}

/** @param {unknown} value @param {string} kind */
export function optionalText(value, kind) {
  if (value == null || value === "") return "";
  const text = coerceText(value);
  if (!text) {
    throw new Error(`Invalid ${kind}: text fields must be strings`);
  }
  return text;
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** @param {unknown} value @param {string} where @param {string} kind @returns {string | null} */
export function readAccent(value, where, kind) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new Error(`Invalid ${kind}: ${where} must be rose or a hex color`);
  }
  const text = value.trim();
  if (text === "rose") return "var(--mark-rose)";
  if (HEX.test(text)) return text;
  throw new Error(`Invalid ${kind}: ${where} must be rose or a hex color`);
}
