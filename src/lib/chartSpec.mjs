import yaml from "js-yaml";

/** @typedef {"bar" | "grouped-bar" | "horizontal-bar" | "line"} ChartType */
/** @typedef {"gemini" | "openai" | "anthropic" | "xai" | "neutral"} ChartVendor */

/**
 * @typedef {{
 *   name: string,
 *   vendor: ChartVendor,
 *   vendorExplicit: boolean,
 *   color: string | null,
 *   values: Array<number | null>,
 *   texts: string[],
 * }} ChartSeries
 */

/**
 * @typedef {{
 *   type: ChartType,
 *   title: string,
 *   unit: string,
 *   source: string,
 *   sourceUrl: string | null,
 *   higherIsBetter: boolean | null,
 *   highlight: string | null,
 *   labels: string[],
 *   series: ChartSeries[],
 *   colors: Record<string, string>,
 * }} ChartSpec
 */

const CHART_TYPES = ["bar", "grouped-bar", "horizontal-bar", "line"];
const VENDORS = ["gemini", "openai", "anthropic", "xai", "neutral"];
const MAX_LABELS = 40;
const MAX_SERIES = 8;

/**
 * @param {string} name
 * @returns {ChartVendor}
 */
export function vendorFromName(name) {
  const value = name.toLowerCase();
  if (value.includes("gemini")) return "gemini";
  if (value.includes("gpt") || value.includes("openai") || value.includes("chatgpt")) {
    return "openai";
  }
  if (value.includes("claude") || value.includes("anthropic")) return "anthropic";
  if (value.includes("grok") || value.includes("xai") || value.includes("x.ai")) {
    return "xai";
  }
  return "neutral";
}

/**
 * @param {string} name
 * @param {string | null} highlight
 */
export function matchesHighlight(name, highlight) {
  if (!highlight || !name) return false;
  if (name === highlight) return true;
  if (!name.startsWith(highlight)) return false;
  const next = name[highlight.length];
  return next === " " || next === "(";
}

/**
 * @param {string} source
 * @returns {ChartSpec}
 */
export function normalizeChartSpec(source) {
  const text = String(source ?? "").trim();
  if (!text) {
    throw new Error("Invalid chart: spec is empty");
  }

  let data;
  try {
    data = text.startsWith("{") ? JSON.parse(text) : yaml.load(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid chart: ${message}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid chart: spec must be a YAML or JSON object");
  }

  const record = /** @type {Record<string, unknown>} */ (data);
  const type = requireEnum(record.type, CHART_TYPES, "type");
  const title = requireText(record.title, "title");
  const unit = optionalText(record.unit);
  const sourceText = optionalText(record.source);
  const sourceUrl = optionalUrl(record.sourceUrl);
  const higherIsBetter = optionalBoolean(record.higherIsBetter, "higherIsBetter");
  const highlight = optionalText(record.highlight) || null;
  const colors = optionalColorMap(record.colors);
  const { labels, series } = readSeries(record);

  return {
    type,
    title,
    unit,
    source: sourceText,
    sourceUrl,
    higherIsBetter,
    highlight,
    labels,
    series,
    colors,
  };
}

/**
 * Color for one bar. A single-series bar or horizontal bar uses each label's vendor
 * unless that series sets an explicit vendor or color.
 * @param {ChartSpec} spec
 * @param {ChartSeries} series
 * @param {string} label
 * @returns {{ vendor: ChartVendor, color: string | null }}
 */
export function barPaint(spec, series, label) {
  const perCategory =
    spec.series.length === 1 && (spec.type === "bar" || spec.type === "horizontal-bar");
  const vendor = perCategory && !series.vendorExplicit ? vendorFromName(label) : series.vendor;
  const color =
    (perCategory ? spec.colors[label] : null) ||
    spec.colors[series.name] ||
    series.color ||
    spec.colors[vendor] ||
    null;
  return { vendor, color };
}

/**
 * @param {Record<string, unknown>} record
 * @returns {{ labels: string[], series: ChartSeries[] }}
 */
function readSeries(record) {
  const hasSeries = Array.isArray(record.series);
  const hasValues = Array.isArray(record.values);

  if (!hasSeries && !hasValues) {
    throw new Error("Invalid chart: provide values or series");
  }

  if (hasSeries && hasValues) {
    throw new Error("Invalid chart: use either values or series, not both");
  }

  const labels = requireLabels(record.labels);

  /** @type {ChartSeries[]} */
  let series;
  if (hasValues) {
    const parsed = parseValues(record.values, labels.length, "values");
    series = [
      {
        name: "",
        vendor: "neutral",
        vendorExplicit: false,
        color: null,
        values: parsed.values,
        texts: parsed.texts,
      },
    ];
  } else {
    const rawSeries = /** @type {unknown[]} */ (record.series);
    if (rawSeries.length < 1 || rawSeries.length > MAX_SERIES) {
      throw new Error(`Invalid chart: series must contain 1 to ${MAX_SERIES} entries`);
    }
    series = rawSeries.map((entry, index) => readOneSeries(entry, index, labels.length));
  }

  const numeric = series.some((item) => item.values.some((value) => value != null));
  if (!numeric) {
    throw new Error("Invalid chart: at least one value must be a number");
  }

  return { labels, series };
}

/**
 * @param {unknown} entry
 * @param {number} index
 * @param {number} labelCount
 * @returns {ChartSeries}
 */
function readOneSeries(entry, index, labelCount) {
  const where = `series[${index}]`;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(`Invalid chart: ${where} must be an object`);
  }
  const record = /** @type {Record<string, unknown>} */ (entry);
  const name = requireText(record.name, `${where}.name`);
  const vendorExplicit = record.vendor != null && record.vendor !== "";
  const vendor = vendorExplicit
    ? requireEnum(record.vendor, VENDORS, `${where}.vendor`)
    : vendorFromName(name);
  const color = optionalColor(record.color, `${where}.color`);
  const parsed = parseValues(record.values, labelCount, `${where}.values`);
  return {
    name,
    vendor,
    vendorExplicit,
    color,
    values: parsed.values,
    texts: parsed.texts,
  };
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function requireLabels(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_LABELS) {
    throw new Error(`Invalid chart: labels must contain 1 to ${MAX_LABELS} entries`);
  }
  return value.map((entry, index) => requireText(entry, `labels[${index}]`));
}

/**
 * @param {unknown} value
 * @param {number} labelCount
 * @param {string} where
 * @returns {{ values: Array<number | null>, texts: string[] }}
 */
function parseValues(value, labelCount, where) {
  if (!Array.isArray(value) || value.length !== labelCount) {
    throw new Error(`Invalid chart: ${where} must have one entry per label`);
  }
  /** @type {Array<number | null>} */
  const values = [];
  /** @type {string[]} */
  const texts = [];
  value.forEach((entry, index) => {
    const parsed = parseValue(entry, `${where}[${index}]`);
    values.push(parsed.value);
    texts.push(parsed.text);
  });
  return { values, texts };
}

/**
 * @param {unknown} value
 * @param {string} where
 * @returns {{ value: number | null, text: string }}
 */
function parseValue(value, where) {
  if (value == null) return { value: null, text: "N/A" };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid chart: ${where} must be a finite number or null`);
    }
    return { value, text: formatNumber(value) };
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "" || text.toLowerCase() === "n/a" || text === "null") {
      return { value: null, text: "N/A" };
    }
    const numeric = Number(text);
    if (Number.isFinite(numeric)) {
      return { value: numeric, text };
    }
  }
  throw new Error(`Invalid chart: ${where} must be a number or null`);
}

/**
 * @param {number} value
 */
function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(value);
}

/**
 * @param {unknown} value
 * @param {readonly string[]} allowed
 * @param {string} where
 */
function requireEnum(value, allowed, where) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`Invalid chart: ${where} must be ${allowed.join(", ")}`);
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} where
 */
function requireText(value, where) {
  const text = coerceText(value);
  if (!text) {
    throw new Error(`Invalid chart: ${where} must be a non-empty string`);
  }
  return text;
}

/**
 * @param {unknown} value
 */
function optionalText(value) {
  if (value == null || value === "") return "";
  const text = coerceText(value);
  if (!text) {
    throw new Error("Invalid chart: text fields must be strings");
  }
  return text;
}

/**
 * @param {unknown} value
 */
function coerceText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

/**
 * @param {unknown} value
 * @param {string} where
 * @returns {boolean | null}
 */
function optionalBoolean(value, where) {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value;
  throw new Error(`Invalid chart: ${where} must be true or false`);
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function optionalUrl(value) {
  const text = optionalText(value);
  if (!text) return null;
  if (!/^https?:\/\//i.test(text)) {
    throw new Error("Invalid chart: sourceUrl must start with http:// or https://");
  }
  return text;
}

/**
 * @param {unknown} value
 * @param {string} where
 * @returns {string | null}
 */
function optionalColor(value, where) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())) {
    throw new Error(`Invalid chart: ${where} must be a hex color`);
  }
  return value.trim();
}

/**
 * @param {unknown} value
 * @returns {Record<string, string>}
 */
function optionalColorMap(value) {
  if (value == null || value === "") return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid chart: colors must be a map of names to hex colors");
  }
  /** @type {Record<string, string>} */
  const colors = {};
  for (const [key, entry] of Object.entries(value)) {
    const color = optionalColor(entry, `colors.${key}`);
    if (color) colors[key] = color;
  }
  return colors;
}
