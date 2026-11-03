import { normalizeTimelineSpec } from "@/lib/timelineSpec.mjs";

type TimelineEvidence = "confirmed" | "claim" | "none";

interface TimelineItem {
  time: string;
  event: string;
  evidence: TimelineEvidence | "";
}

interface TimelineSpec {
  items: TimelineItem[];
  legend: Record<TimelineEvidence, string>;
}

const EVIDENCE: TimelineEvidence[] = ["confirmed", "claim", "none"];

function Dot({ evidence }: { evidence: TimelineEvidence | "" | "plain" }) {
  const kind = evidence || "plain";
  return <span className={`mark-timeline-dot mark-timeline-dot-${kind}`} aria-hidden="true" />;
}

export function Timeline({ spec: raw }: { spec: string }) {
  const spec = normalizeTimelineSpec(raw) as TimelineSpec;
  const legend = EVIDENCE.filter((kind) => spec.items.some((item) => item.evidence === kind));

  return (
    <figure className="mark-block mark-timeline not-prose" data-mark="timeline">
      <ol className="mark-timeline-list">
        {spec.items.map((item, index) => (
          <li className="mark-timeline-item" key={`${item.time}-${index}`}>
            <Dot evidence={item.evidence} />
            <div className="mark-timeline-body">
              <div className="mark-timeline-time">{item.time}</div>
              <div className="mark-timeline-event">
                {item.event}
                {item.evidence ? <span className="mark-sr">{spec.legend[item.evidence]}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {legend.length > 0 ? (
        <p className="mark-timeline-legend">
          {legend.map((kind) => (
            <span className="mark-timeline-legend-item" key={kind}>
              <Dot evidence={kind} />
              <span>{spec.legend[kind]}</span>
            </span>
          ))}
        </p>
      ) : null}
    </figure>
  );
}
