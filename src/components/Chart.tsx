import { useId } from "react";
import {
  barPaint,
  matchesHighlight,
  normalizeChartSpec,
} from "@/lib/chartSpec.mjs";

type ChartVendor = "gemini" | "openai" | "anthropic" | "xai" | "neutral";
type ChartType = "bar" | "grouped-bar" | "horizontal-bar" | "line";

interface ChartSeries {
  name: string;
  vendor: ChartVendor;
  vendorExplicit: boolean;
  color: string | null;
  values: Array<number | null>;
  texts: string[];
}

interface ChartSpec {
  type: ChartType;
  title: string;
  unit: string;
  source: string;
  sourceUrl: string | null;
  higherIsBetter: boolean | null;
  highlight: string | null;
  labels: string[];
  series: ChartSeries[];
  colors: Record<string, string>;
}

type Variant = "wide" | "narrow";

function paintFill(vendor: ChartVendor, color: string | null) {
  return color ?? `var(--chart-${vendor})`;
}

function textWidth(text: string, fontSize: number) {
  let width = 0;
  for (const char of text) {
    width += /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(char)
      ? fontSize
      : fontSize * 0.56;
  }
  return width;
}

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function maxNumeric(spec: ChartSpec) {
  let max = 0;
  for (const series of spec.series) {
    for (const value of series.values) {
      if (value != null && value > max) max = value;
    }
  }
  return max > 0 ? max : 1;
}

function cellText(text: string, unit: string) {
  if (text === "N/A" || !unit) return text;
  if (unit === "%") return `${text}%`;
  return `${text} ${unit}`;
}

function segments(values: Array<number | null>) {
  const parts: number[][] = [];
  let current: number[] = [];
  values.forEach((value, index) => {
    if (value == null) {
      if (current.length > 0) parts.push(current);
      current = [];
    } else {
      current.push(index);
    }
  });
  if (current.length > 0) parts.push(current);
  return parts;
}

function Legend({
  spec,
  width,
  top,
}: {
  spec: ChartSpec;
  width: number;
  top: number;
}) {
  const fontSize = 13;
  let x = 12;
  let y = top;
  const rows: Array<{ series: ChartSeries; x: number; y: number }> = [];

  for (const series of spec.series) {
    const itemWidth = 18 + textWidth(series.name, fontSize) + 16;
    if (x > 12 && x + itemWidth > width - 8) {
      x = 12;
      y += 22;
    }
    rows.push({ series, x, y });
    x += itemWidth;
  }

  return {
    height: y - top + 22,
    node: (
      <g>
        {rows.map(({ series, x: itemX, y: itemY }) => {
          const paint = barPaint(spec, series, series.name);
          const highlighted = matchesHighlight(series.name, spec.highlight);
          return (
            <g key={series.name}>
              <rect
                x={itemX}
                y={itemY}
                width={12}
                height={12}
                rx={2}
                fill={paintFill(paint.vendor, paint.color)}
              />
              <text
                x={itemX + 18}
                y={itemY + 11}
                fontSize={fontSize}
                fontWeight={highlighted ? 700 : 500}
                fill="var(--foreground)"
              >
                {series.name}
              </text>
            </g>
          );
        })}
      </g>
    ),
  };
}

function CategoryLabel({
  text,
  x,
  y,
  width,
  fontSize,
  highlighted,
}: {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  highlighted: boolean;
}) {
  const lines = wrapText(text, width, fontSize);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight={highlighted ? 700 : 500}
      fill="var(--foreground)"
    >
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : fontSize + 2}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function HorizontalChart({ spec, variant }: { spec: ChartSpec; variant: Variant }) {
  const wide = variant === "wide";
  const width = wide ? 720 : 360;
  const rowH = wide ? 34 : 50;
  const height = 8 + spec.labels.length * rowH;
  const max = maxNumeric(spec);
  const series = spec.series[0];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={wide ? "chart-wide" : "chart-narrow"}
      role="presentation"
    >
      {spec.labels.map((label, index) => {
        const value = series.values[index];
        const text = series.texts[index];
        const paint = barPaint(spec, series, label);
        const highlighted =
          matchesHighlight(label, spec.highlight) ||
          matchesHighlight(series.name, spec.highlight);
        const y = 4 + index * rowH;
        const fill = paintFill(paint.vendor, paint.color);

        if (!wide) {
          const barY = y + 28;
          const barMax = width - 20;
          const barW = value != null && value > 0 ? (value / max) * barMax : 0;
          return (
            <g key={`${label}-${index}`} data-highlight={highlighted ? "true" : undefined}>
              {highlighted ? (
                <rect x={4} y={y + 1} width={width - 8} height={rowH - 4} rx={6} fill="var(--accent-soft)" />
              ) : null}
              <text
                x={12}
                y={y + 18}
                fontSize={14}
                fontWeight={highlighted ? 700 : 500}
                fill="var(--foreground)"
              >
                {label}
              </text>
              <text
                x={width - 12}
                y={y + 18}
                fontSize={14}
                fontWeight={700}
                textAnchor="end"
                fill={value == null ? "var(--text-muted)" : "var(--foreground)"}
              >
                {text}
              </text>
              {value == null ? null : (
                <>
                  <rect x={10} y={barY} width={barMax} height={12} rx={4} fill="var(--chart-track)" />
                  {barW > 0 ? (
                    <rect
                      x={10}
                      y={barY}
                      width={Math.max(barW, 2)}
                      height={12}
                      rx={4}
                      fill={fill}
                      stroke={highlighted ? "var(--foreground)" : "none"}
                      strokeWidth={highlighted ? 1.5 : 0}
                    />
                  ) : null}
                </>
              )}
            </g>
          );
        }

        const barX = 304;
        const barMax = width - barX - 64;
        const barH = 16;
        const barY = y + (rowH - barH) / 2;
        const barW = value != null && value > 0 ? (value / max) * barMax : 0;
        return (
          <g key={`${label}-${index}`} data-highlight={highlighted ? "true" : undefined}>
            {highlighted ? (
              <rect x={4} y={y + 2} width={width - 8} height={rowH - 4} rx={6} fill="var(--accent-soft)" />
            ) : null}
            <text
              x={14}
              y={y + rowH / 2}
              fontSize={15}
              fontWeight={highlighted ? 700 : 500}
              dominantBaseline="middle"
              fill="var(--foreground)"
            >
              {label}
            </text>
            {value == null ? (
              <text
                x={barX}
                y={y + rowH / 2}
                fontSize={13}
                dominantBaseline="middle"
                fill="var(--text-muted)"
              >
                N/A
              </text>
            ) : (
              <>
                <rect x={barX} y={barY} width={barMax} height={barH} rx={4} fill="var(--chart-track)" />
                {barW > 0 ? (
                  <rect
                    x={barX}
                    y={barY}
                    width={Math.max(barW, 2)}
                    height={barH}
                    rx={4}
                    fill={fill}
                    stroke={highlighted ? "var(--foreground)" : "none"}
                    strokeWidth={highlighted ? 1.5 : 0}
                  />
                ) : null}
                <text
                  x={barX + barW + 8}
                  y={y + rowH / 2}
                  fontSize={14}
                  fontWeight={700}
                  dominantBaseline="middle"
                  fill="var(--foreground)"
                >
                  {text}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ColumnChart({ spec, variant }: { spec: ChartSpec; variant: Variant }) {
  const wide = variant === "wide";
  const width = wide ? 720 : 360;
  const multi = spec.series.length > 1;
  const legend = multi ? Legend({ spec, width, top: 6 }) : null;
  const plotH = wide ? 188 : 148;
  const plotTop = (legend ? 6 + legend.height : 0) + 20;
  const height = plotTop + plotH + 46;
  const max = maxNumeric(spec);
  const padX = 16;
  const plotW = width - padX * 2;
  const groupW = plotW / spec.labels.length;
  const gap = spec.series.length > 1 ? 6 : 0;
  const barW = Math.min(
    wide ? 34 : 22,
    (groupW - 18 - gap * (spec.series.length - 1)) / spec.series.length,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={wide ? "chart-wide" : "chart-narrow"}
      role="presentation"
    >
      {legend?.node}
      <line
        x1={padX}
        y1={plotTop + plotH}
        x2={width - padX}
        y2={plotTop + plotH}
        stroke="var(--card-border)"
        strokeWidth={1}
      />
      {spec.labels.map((label, index) => {
        const groupX = padX + index * groupW;
        const totalW = spec.series.length * barW + (spec.series.length - 1) * gap;
        const start = groupX + (groupW - totalW) / 2;
        const groupHighlighted = matchesHighlight(label, spec.highlight);
        return (
          <g key={`${label}-${index}`} data-highlight={groupHighlighted ? "true" : undefined}>
            {groupHighlighted ? (
              <rect
                x={groupX + 4}
                y={plotTop - 18}
                width={groupW - 8}
                height={plotH + 18}
                rx={6}
                fill="var(--accent-soft)"
              />
            ) : null}
            {spec.series.map((series, seriesIndex) => {
              const value = series.values[index];
              const text = series.texts[index];
              const paint = barPaint(spec, series, label);
              const highlighted =
                groupHighlighted || matchesHighlight(series.name, spec.highlight);
              const x = start + seriesIndex * (barW + gap);
              const barH = value != null && value > 0 ? (value / max) * plotH : 0;
              const y = plotTop + plotH - barH;
              return (
                <g key={series.name || seriesIndex}>
                  {value == null ? (
                    <text
                      x={x + barW / 2}
                      y={plotTop + plotH - 8}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--text-muted)"
                    >
                      N/A
                    </text>
                  ) : (
                    <>
                      {barH > 0 ? (
                        <rect
                          x={x}
                          y={y}
                          width={barW}
                          height={barH}
                          rx={3}
                          fill={paintFill(paint.vendor, paint.color)}
                          stroke={highlighted ? "var(--foreground)" : "none"}
                          strokeWidth={highlighted ? 1.5 : 0}
                        />
                      ) : null}
                      <text
                        x={x + barW / 2}
                        y={Math.max(14, y - 6)}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={700}
                        fill="var(--foreground)"
                      >
                        {text}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            <CategoryLabel
              text={label}
              x={groupX + groupW / 2}
              y={plotTop + plotH + 18}
              width={groupW - 8}
              fontSize={wide ? 13 : 12}
              highlighted={groupHighlighted}
            />
          </g>
        );
      })}
    </svg>
  );
}

function GroupedRows({ spec, variant }: { spec: ChartSpec; variant: Variant }) {
  const wide = variant === "wide";
  const width = wide ? 720 : 360;
  const nameW = wide ? 210 : 148;
  const headerH = 24;
  const barRow = 26;
  const blockGap = 14;
  const blockH = headerH + spec.series.length * barRow;
  const height = 8 + spec.labels.length * (blockH + blockGap);
  const max = maxNumeric(spec);
  const barX = 12 + nameW;
  const barMax = width - barX - 56;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={wide ? "chart-wide" : "chart-narrow"}
      role="presentation"
    >
      {spec.labels.map((label, index) => {
        const top = 4 + index * (blockH + blockGap);
        const groupHighlighted = matchesHighlight(label, spec.highlight);
        return (
          <g key={`${label}-${index}`} data-highlight={groupHighlighted ? "true" : undefined}>
            {groupHighlighted ? (
              <rect x={4} y={top} width={width - 8} height={blockH} rx={6} fill="var(--accent-soft)" />
            ) : null}
            <text x={12} y={top + 16} fontSize={14} fontWeight={700} fill="var(--foreground)">
              {label}
            </text>
            {spec.series.map((series, seriesIndex) => {
              const value = series.values[index];
              const text = series.texts[index];
              const paint = barPaint(spec, series, label);
              const highlighted =
                groupHighlighted || matchesHighlight(series.name, spec.highlight);
              const y = top + headerH + seriesIndex * barRow;
              const barW = value != null && value > 0 ? (value / max) * barMax : 0;
              return (
                <g key={series.name || seriesIndex}>
                  <rect
                    x={12}
                    y={y + 4}
                    width={10}
                    height={10}
                    rx={2}
                    fill={paintFill(paint.vendor, paint.color)}
                  />
                  <text
                    x={28}
                    y={y + 14}
                    fontSize={12}
                    fontWeight={highlighted ? 700 : 500}
                    fill="var(--foreground)"
                  >
                    {series.name}
                  </text>
                  {value == null ? (
                    <text x={barX} y={y + 14} fontSize={12} fill="var(--text-muted)">
                      N/A
                    </text>
                  ) : (
                    <>
                      <rect x={barX} y={y + 4} width={barMax} height={12} rx={3} fill="var(--chart-track)" />
                      {barW > 0 ? (
                        <rect
                          x={barX}
                          y={y + 4}
                          width={Math.max(barW, 2)}
                          height={12}
                          rx={3}
                          fill={paintFill(paint.vendor, paint.color)}
                          stroke={highlighted ? "var(--foreground)" : "none"}
                          strokeWidth={highlighted ? 1.5 : 0}
                        />
                      ) : null}
                      <text
                        x={barX + barW + 6}
                        y={y + 14}
                        fontSize={12}
                        fontWeight={700}
                        fill="var(--foreground)"
                      >
                        {text}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ spec, variant }: { spec: ChartSpec; variant: Variant }) {
  const wide = variant === "wide";
  const width = wide ? 720 : 360;
  const multi = spec.series.length > 1;
  const legend = multi ? Legend({ spec, width, top: 6 }) : null;
  const plotTop = (legend ? 6 + legend.height : 0) + 18;
  const plotH = wide ? 180 : 140;
  const height = plotTop + plotH + 48;
  const max = maxNumeric(spec);
  const padX = 24;
  const plotW = width - padX * 2;
  const step = spec.labels.length === 1 ? 0 : plotW / (spec.labels.length - 1);
  const xAt = (index: number) =>
    spec.labels.length === 1 ? width / 2 : padX + index * step;
  const yAt = (value: number) => plotTop + plotH - (value / max) * plotH;
  const showValues = spec.labels.length <= 8 && spec.series.length === 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={wide ? "chart-wide" : "chart-narrow"}
      role="presentation"
    >
      {legend?.node}
      <line
        x1={padX}
        y1={plotTop + plotH}
        x2={width - padX}
        y2={plotTop + plotH}
        stroke="var(--card-border)"
      />
      {spec.series.map((series, seriesIndex) => {
        const paint = barPaint(spec, series, series.name || spec.labels[0] || "");
        const fill = paintFill(paint.vendor, paint.color);
        return (
          <g key={series.name || seriesIndex}>
            {segments(series.values).map((part) => (
              <polyline
                key={part.join("-")}
                fill="none"
                stroke={fill}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={part
                  .map((index) => {
                    const value = series.values[index];
                    return `${xAt(index)},${yAt(value ?? 0)}`;
                  })
                  .join(" ")}
              />
            ))}
            {series.values.map((value, index) => {
              const highlighted = matchesHighlight(spec.labels[index], spec.highlight);
              if (value == null) {
                return (
                  <text
                    key={`${series.name}-na-${index}`}
                    x={xAt(index)}
                    y={plotTop + plotH - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--text-muted)"
                  >
                    N/A
                  </text>
                );
              }
              return (
                <g key={`${series.name}-${index}`}>
                  <circle cx={xAt(index)} cy={yAt(value)} r={highlighted ? 6 : 4} fill={fill} />
                  {showValues ? (
                    <text
                      x={xAt(index)}
                      y={yAt(value) - 10}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={700}
                      fill="var(--foreground)"
                    >
                      {series.texts[index]}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {spec.labels.map((label, index) => (
        <CategoryLabel
          key={`${label}-${index}`}
          text={label}
          x={xAt(index)}
          y={plotTop + plotH + 18}
          width={Math.max(step - 4, 48)}
          fontSize={12}
          highlighted={matchesHighlight(label, spec.highlight)}
        />
      ))}
    </svg>
  );
}

function ChartSvg({ spec, variant }: { spec: ChartSpec; variant: Variant }) {
  const multi = spec.series.length > 1;
  if (spec.type === "line") return <LineChart spec={spec} variant={variant} />;
  if (spec.type === "horizontal-bar") {
    return multi ? (
      <GroupedRows spec={spec} variant={variant} />
    ) : (
      <HorizontalChart spec={spec} variant={variant} />
    );
  }
  if (spec.type === "grouped-bar" && variant === "narrow") {
    return <GroupedRows spec={spec} variant={variant} />;
  }
  if (spec.type === "bar" && variant === "narrow" && (multi || spec.labels.length > 6)) {
    return multi ? (
      <GroupedRows spec={spec} variant={variant} />
    ) : (
      <HorizontalChart spec={spec} variant={variant} />
    );
  }
  return <ColumnChart spec={spec} variant={variant} />;
}

function ChartTable({ spec }: { spec: ChartSpec }) {
  return (
    <table className="chart-sr">
      <caption>
        {spec.title}
        {spec.source ? `. ${spec.source}` : ""}
      </caption>
      <thead>
        <tr>
          <th scope="col">{spec.title}</th>
          {spec.series.map((series, index) => (
            <th key={series.name || index} scope="col">
              {series.name || spec.unit || spec.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {spec.labels.map((label, index) => (
          <tr key={`${label}-${index}`}>
            <th scope="row">{label}</th>
            {spec.series.map((series, seriesIndex) => (
              <td key={series.name || seriesIndex}>
                {cellText(series.texts[index], spec.unit)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Chart({ spec: raw }: { spec: string }) {
  const spec = normalizeChartSpec(raw) as ChartSpec;
  const captionId = useId();

  return (
    <figure
      className="chart-block not-prose"
      data-chart={spec.type}
      data-higher-is-better={
        spec.higherIsBetter == null ? undefined : String(spec.higherIsBetter)
      }
      aria-labelledby={captionId}
    >
      <figcaption id={captionId}>
        <div className="chart-title">{spec.title}</div>
        {spec.source ? (
          <div className="chart-source">
            {spec.sourceUrl ? (
              <a href={spec.sourceUrl} rel="noreferrer">
                {spec.source}
              </a>
            ) : (
              spec.source
            )}
          </div>
        ) : null}
      </figcaption>
      <ChartSvg spec={spec} variant="wide" />
      <ChartSvg spec={spec} variant="narrow" />
      <ChartTable spec={spec} />
    </figure>
  );
}
