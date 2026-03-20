"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { theme } = useTheme();
  const diagramId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        setSvg(null);
        setError(null);

        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: theme === "dark" ? "dark" : "default",
          fontFamily: "Hahmlet, serif",
        });

        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${diagramId}`,
          chart
        );

        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Mermaid diagram render failed."
          );
        }
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId, theme]);

  if (error) {
    return (
      <div className="not-prose mermaid-diagram">
        <div className="mermaid-diagram__error">
          <p className="mermaid-diagram__message">
            다이어그램을 렌더링하지 못했습니다.
          </p>
          <p className="mermaid-diagram__details">{error}</p>
          <pre className="mermaid-diagram__code">{chart}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose mermaid-diagram">
      {svg ? (
        <div
          className="mermaid-diagram__surface"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="mermaid-diagram__loading">다이어그램을 불러오는 중입니다.</div>
      )}
    </div>
  );
}
