import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "소개",
  description: "블로그 주인장을 소개합니다.",
};

function getAboutContent(): string {
  const extensions = [".mdx", ".md"];
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), `content/about${ext}`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }
  throw new Error("About content not found");
}

const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt || ""}
      style={{
        borderRadius: "50%",
        width: "150px",
        height: "150px",
        objectFit: "cover",
        display: "block",
        margin: "0 auto",
      }}
    />
  ),
};

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="prose max-w-none">
        <MDXRemote
          source={content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </div>
    </div>
  );
}
