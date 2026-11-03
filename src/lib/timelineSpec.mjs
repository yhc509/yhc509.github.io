import { loadSpec, requireText } from "./specYaml.mjs";

/**
 * @typedef {"confirmed" | "claim" | "none"} TimelineEvidence
 * @typedef {{ time: string, event: string, evidence: TimelineEvidence | "" }} TimelineItem
 * @typedef {{ items: TimelineItem[], legend: Record<TimelineEvidence, string> }} TimelineSpec
 */

const MAX_ITEMS = 12;
const EVIDENCE = ["confirmed", "claim", "none"];

/** @param {string} source @returns {TimelineSpec} */
export function normalizeTimelineSpec(source) {
  const record = loadSpec(source, "timeline");
  const items = readItems(record.items);
  const used = new Set(items.map((item) => item.evidence).filter(Boolean));
  const legend = readLegend(record.legend, used);
  return { items, legend };
}

/** @param {unknown} value @returns {TimelineItem[]} */
function readItems(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_ITEMS) {
    throw new Error(`Invalid timeline: items must contain 1 to ${MAX_ITEMS} entries`);
  }
  return value.map((entry, index) => {
    const where = `items[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Invalid timeline: ${where} must be an object`);
    }
    const record = /** @type {Record<string, unknown>} */ (entry);
    return {
      time: requireText(record.time, `${where}.time`, "timeline"),
      event: requireText(record.event, `${where}.event`, "timeline"),
      evidence: readEvidence(record.evidence, `${where}.evidence`),
    };
  });
}

/** @param {unknown} value @param {string} where @returns {TimelineEvidence | ""} */
function readEvidence(value, where) {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || !EVIDENCE.includes(value)) {
    throw new Error(`Invalid timeline: ${where} must be confirmed, claim, or none`);
  }
  return /** @type {TimelineEvidence} */ (value);
}

/**
 * @param {unknown} value
 * @param {Set<string>} used
 * @returns {Record<TimelineEvidence, string>}
 */
function readLegend(value, used) {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, unknown>} */ (value)
      : null;
  if (used.size > 0 && !record) {
    throw new Error("Invalid timeline: legend is required when an item has evidence");
  }
  /** @type {Record<TimelineEvidence, string>} */
  const legend = { confirmed: "", claim: "", none: "" };
  for (const kind of EVIDENCE) {
    if (!used.has(kind)) continue;
    legend[kind] = requireText(record?.[kind], `legend.${kind}`, "timeline");
  }
  return legend;
}
