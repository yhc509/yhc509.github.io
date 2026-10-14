import { useId, type CSSProperties } from "react";
import { loadIcon, scopeSvgIds, splitSvg } from "@/lib/icons.mjs";

export function MarkIcon({
  name,
  label,
  className,
  style,
}: {
  name: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const icon = loadIcon(name);
  const prefix = useId().replace(/:/g, "");
  const { viewBox, inner } = splitSvg(scopeSvgIds(icon.svg, prefix));
  const accessible = label || undefined;

  return (
    <svg
      className={className ? `mark-glyph ${className}` : "mark-glyph"}
      viewBox={viewBox}
      style={style}
      fill={icon.stroke ? "none" : undefined}
      stroke={icon.stroke ? "currentColor" : undefined}
      strokeWidth={icon.stroke ? 2 : undefined}
      strokeLinecap={icon.stroke ? "round" : undefined}
      strokeLinejoin={icon.stroke ? "round" : undefined}
      role={accessible ? "img" : undefined}
      aria-label={accessible}
      aria-hidden={accessible ? undefined : true}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

export function iconLabel(name: string, label: string) {
  const explicit = label.trim();
  if (explicit) return explicit;
  const brand = loadIcon(name).label;
  if (!brand) {
    throw new Error(`Icon "${name}" needs a label`);
  }
  return brand;
}
