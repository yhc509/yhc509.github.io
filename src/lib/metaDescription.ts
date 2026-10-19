const META_DESCRIPTION_LIMIT = 160;

export function clampMetaDescription(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= META_DESCRIPTION_LIMIT) {
    return text;
  }

  const slice = text.slice(0, META_DESCRIPTION_LIMIT + 1);
  const space = slice.lastIndexOf(" ");
  const bounded = (space > 0 ? slice.slice(0, space) : text.slice(0, META_DESCRIPTION_LIMIT)).replace(
    /[\s,;:]+$/u,
    "",
  );

  return bounded.length > 0 ? bounded : text.slice(0, META_DESCRIPTION_LIMIT);
}
