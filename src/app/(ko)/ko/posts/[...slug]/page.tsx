import {
  generatePostMetadata,
  generatePostStaticParams,
  PostScreen,
  type PostPageProps,
} from "@/components/pages/PostScreen";

export const generateStaticParams = generatePostStaticParams;

export function generateMetadata(props: PostPageProps) {
  return generatePostMetadata(props, "ko");
}

export default function KoreanPostPage(props: PostPageProps) {
  return <PostScreen {...props} language="ko" />;
}
