import {
  generatePostMetadata,
  generatePostStaticParams,
  PostScreen,
  type PostPageProps,
} from "@/components/pages/PostScreen";

export function generateStaticParams() {
  return generatePostStaticParams("en");
}

export function generateMetadata(props: PostPageProps) {
  return generatePostMetadata(props, "en");
}

export default function PostPage(props: PostPageProps) {
  return <PostScreen {...props} language="en" />;
}
