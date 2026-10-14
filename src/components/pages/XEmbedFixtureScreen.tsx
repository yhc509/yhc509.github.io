import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { XPost } from "@/components/XPost";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { remarkXPost } from "@/lib/remarkXPost.mjs";

const source = `
## Component

<XPost id="2109678093640323561" />

## URL

https://x.com/abhinavflac/status/2109678093640323561

## Fallback

<XPost id="0" />
`;

export function XEmbedFixtureScreen() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <article>
        <h1 className="mb-8 text-3xl font-bold">X embed fixture</h1>
        <div className="prose max-w-none">
          <MDXRemote
            source={source}
            components={{ ...createMarkdownComponents(), XPost }}
            options={{
              mdxOptions: { remarkPlugins: [remarkGfm, remarkXPost] },
            }}
          />
        </div>
      </article>
    </div>
  );
}
