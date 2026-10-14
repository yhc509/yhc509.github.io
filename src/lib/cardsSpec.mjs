import { loadSpec, optionalText, readAccent, requireText } from "./specYaml.mjs";

/**
 * @typedef {{ name: string, label: string }} IconRef
 * @typedef {{ icon: string, label: string, sublabel: string, accent: string | null }} CardItem
 * @typedef {{
 *   logos: IconRef[],
 *   logo: IconRef | null,
 *   caption: string,
 *   cards: CardItem[],
 * }} CardsSpec
 */

const MAX_LOGOS = 8;
const MAX_CARDS = 8;

/** @param {string} source @returns {CardsSpec} */
export function normalizeCardsSpec(source) {
  const record = loadSpec(source, "cards");
  const logos = readIcons(record.logos, "logos");
  const logo = record.logo == null || record.logo === "" ? null : readIcon(record.logo, "logo");
  if (logos.length > 0 && logo) {
    throw new Error("Invalid cards: use logos or logo, not both");
  }
  const caption = optionalText(record.caption, "cards");
  const cards = readCards(record.cards);
  if (logos.length === 0 && !logo && cards.length === 0) {
    throw new Error("Invalid cards: add logos, logo, or cards");
  }
  return { logos, logo, caption, cards };
}

/** @param {unknown} value @param {string} where @returns {IconRef[]} */
function readIcons(value, where) {
  if (value == null || value === "") return [];
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_LOGOS) {
    throw new Error(`Invalid cards: ${where} must contain 1 to ${MAX_LOGOS} icons`);
  }
  return value.map((entry, index) => readIcon(entry, `${where}[${index}]`));
}

/** @param {unknown} value @param {string} where @returns {IconRef} */
function readIcon(value, where) {
  if (typeof value === "string") {
    return { name: requireText(value, where, "cards"), label: "" };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid cards: ${where} must be an icon name or { icon, label }`);
  }
  const record = /** @type {Record<string, unknown>} */ (value);
  return {
    name: requireText(record.icon ?? record.name, `${where}.icon`, "cards"),
    label: optionalText(record.label, "cards"),
  };
}

/** @param {unknown} value @returns {CardItem[]} */
function readCards(value) {
  if (value == null || value === "") return [];
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_CARDS) {
    throw new Error(`Invalid cards: cards must contain 1 to ${MAX_CARDS} entries`);
  }
  return value.map((entry, index) => {
    const where = `cards[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Invalid cards: ${where} must be an object`);
    }
    const record = /** @type {Record<string, unknown>} */ (entry);
    return {
      icon: requireText(record.icon, `${where}.icon`, "cards"),
      label: requireText(record.label, `${where}.label`, "cards"),
      sublabel: optionalText(record.sublabel, "cards"),
      accent: readAccent(record.accent, `${where}.accent`, "cards"),
    };
  });
}
