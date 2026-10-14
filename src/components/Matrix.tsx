import { MarkIcon } from "@/components/MarkIcon";
import { matrixLegend, normalizeMatrixSpec } from "@/lib/matrixSpec.mjs";

type MatrixCell =
  | { kind: "check" }
  | { kind: "none" }
  | { kind: "limited"; text: string }
  | { kind: "text"; text: string };

interface MatrixRow {
  icon: string;
  label: string;
  cells: MatrixCell[];
}

interface MatrixSpec {
  columns: string[];
  rows: MatrixRow[];
  legend: { check: string; none: string };
  notes: Record<string, string>;
}

type LegendItem =
  | { kind: "check"; text: string }
  | { kind: "none"; text: string }
  | { kind: "note"; text: string; note: string };

function NoneMark() {
  return <span className="mark-none" aria-hidden="true" />;
}

function Cell({ cell, spec }: { cell: MatrixCell; spec: MatrixSpec }) {
  if (cell.kind === "check") {
    return (
      <td>
        <MarkIcon name="check" className="mark-cell-glyph" />
        <span className="mark-sr">{spec.legend.check}</span>
      </td>
    );
  }
  if (cell.kind === "none") {
    return (
      <td>
        <NoneMark />
        <span className="mark-sr">{spec.legend.none}</span>
      </td>
    );
  }
  return <td>{cell.text}</td>;
}

function Legend({ items }: { items: LegendItem[] }) {
  if (items.length === 0) return null;
  return (
    <p className="mark-legend">
      {items.map((item, index) => (
        <span className="mark-legend-item" key={`${item.kind}-${index}`}>
          {item.kind === "check" ? <MarkIcon name="check" className="mark-cell-glyph" /> : null}
          {item.kind === "none" ? <NoneMark /> : null}
          {item.kind === "note" ? (
            <span>
              {item.text}: {item.note}
            </span>
          ) : (
            <span>{item.text}</span>
          )}
        </span>
      ))}
    </p>
  );
}

export function Matrix({ spec: raw }: { spec: string }) {
  const spec = normalizeMatrixSpec(raw) as MatrixSpec;
  const legend = matrixLegend(spec) as LegendItem[];

  return (
    <figure className="mark-block mark-matrix not-prose" data-mark="matrix">
      <div className="mark-matrix-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col" />
              {spec.columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  <span className="mark-row-label">
                    {row.icon ? <MarkIcon name={row.icon} className="mark-row-glyph" /> : null}
                    {row.label}
                  </span>
                </th>
                {row.cells.map((cell, index) => (
                  <Cell key={`${row.label}-${index}`} cell={cell} spec={spec} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Legend items={legend} />
    </figure>
  );
}
