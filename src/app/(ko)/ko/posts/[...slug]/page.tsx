import {
  generatePostMetadata,
  generatePostStaticParams,
  PostScreen,
  type PostPageProps,
} from "@/components/pages/PostScreen";

export function generateStaticParams() {
  return generatePostStaticParams("ko");
}

export function generateMetadata(props: PostPageProps) {
  return generatePostMetadata(props, "ko");
}

export default function KoreanPostPage(props: PostPageProps) {
  return <PostScreen {...props} language="ko" />;
}
