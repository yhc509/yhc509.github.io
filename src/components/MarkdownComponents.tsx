import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ImgHTMLAttributes,
  type ReactNode,
  type SourceHTMLAttributes,
  type VideoHTMLAttributes,
} from "react";
import type { MDXComponents } from "mdx/types";
import { MermaidDiagram } from "@/components/MermaidDiagram";

type AssetResolver = (src: string | undefined) => string | undefined;

interface MarkdownComponentOptions {
  resolveAssetSrc?: AssetResolver;
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

function identityResolver(src: string | undefined) {
  return src;
}

function stringifyNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(stringifyNode).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return stringifyNode(node.props.children);
  }

  return "";
}

function extractMermaidSource(children: ReactNode) {
  const nodes = Children.toArray(children);

  if (nodes.length !== 1) {
    return null;
  }

  const codeNode = nodes[0];

  if (
    !isValidElement<CodeElementProps>(codeNode) ||
    codeNode.type !== "code"
  ) {
    return null;
  }

  const classNames = codeNode.props.className?.split(/\s+/) ?? [];
  if (!classNames.includes("language-mermaid")) {
    return null;
  }

  const source = stringifyNode(codeNode.props.children).trim();
  return source || null;
}

function MarkdownPre(props: ComponentPropsWithoutRef<"pre">) {
  const diagramSource = extractMermaidSource(props.children);

  if (diagramSource) {
    return <MermaidDiagram chart={diagramSource} />;
  }

  return <pre {...props} />;
}

export function createMarkdownComponents(
  options: MarkdownComponentOptions = {}
): MDXComponents {
  const resolveAssetSrc = options.resolveAssetSrc ?? identityResolver;

  return {
    pre: MarkdownPre,
    img: (
      props: ComponentPropsWithoutRef<"img"> &
        ImgHTMLAttributes<HTMLImageElement>
    ) => {
      const src = resolveAssetSrc(
        typeof props.src === "string" ? props.src : undefined
      );

      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} src={src} alt={props.alt || ""} />;
    },
    video: (
      props: ComponentPropsWithoutRef<"video"> &
        VideoHTMLAttributes<HTMLVideoElement>
    ) => {
      const src = resolveAssetSrc(
        typeof props.src === "string" ? props.src : undefined
      );
      const poster = resolveAssetSrc(
        typeof props.poster === "string" ? props.poster : undefined
      );

      return <video {...props} src={src} poster={poster} />;
    },
    source: (
      props: ComponentPropsWithoutRef<"source"> &
        SourceHTMLAttributes<HTMLSourceElement>
    ) => {
      const src = resolveAssetSrc(
        typeof props.src === "string" ? props.src : undefined
      );

      return <source {...props} src={src} />;
    },
  };
}
