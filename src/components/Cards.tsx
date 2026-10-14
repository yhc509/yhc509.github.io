import { iconLabel, MarkIcon } from "@/components/MarkIcon";
import { normalizeCardsSpec } from "@/lib/cardsSpec.mjs";

interface IconRef {
  name: string;
  label: string;
}

interface CardItem {
  icon: string;
  label: string;
  sublabel: string;
  accent: string | null;
}

interface CardsSpec {
  logos: IconRef[];
  logo: IconRef | null;
  caption: string;
  cards: CardItem[];
}

function LogoTile({ icon }: { icon: IconRef }) {
  const label = iconLabel(icon.name, icon.label);
  return (
    <li className="mark-logo">
      <MarkIcon name={icon.name} label={label} />
    </li>
  );
}

export function Cards({ spec: raw }: { spec: string }) {
  const spec = normalizeCardsSpec(raw) as CardsSpec;

  return (
    <figure className="mark-block mark-cards not-prose" data-mark="cards">
      {spec.logos.length > 0 ? (
        <ul className="mark-logos">
          {spec.logos.map((icon, index) => (
            <LogoTile key={`${icon.name}-${index}`} icon={icon} />
          ))}
        </ul>
      ) : null}
      {spec.logo ? (
        <div className="mark-hero">
          <MarkIcon name={spec.logo.name} label={iconLabel(spec.logo.name, spec.logo.label)} />
        </div>
      ) : null}
      {spec.caption ? (
        <p className="mark-caption">
          <MarkIcon name="arrow-down" className="mark-caption-arrow" />
          <span>{spec.caption}</span>
        </p>
      ) : null}
      {spec.cards.length > 0 ? (
        <ul className="mark-grid">
          {spec.cards.map((card, index) => (
            <li className="mark-card" key={`${card.label}-${index}`}>
              <MarkIcon
                name={card.icon}
                className="mark-card-glyph"
                style={card.accent ? { color: card.accent } : undefined}
              />
              <span className="mark-card-label">{card.label}</span>
              {card.sublabel ? <span className="mark-card-sub">{card.sublabel}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
