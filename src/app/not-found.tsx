import Link from "next/link";
import { shouldUseEnglish } from "@/lib/devLanguage";

export default function NotFound() {
  const useEnglish = shouldUseEnglish();

  return (
    <div
      className="max-w-3xl mx-auto px-5 py-20 text-center"
      style={{ color: "var(--foreground)" }}
    >
      <h1
        className="text-6xl font-bold mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        404
      </h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        {useEnglish ? "Page not found." : "페이지를 찾을 수 없습니다."}
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--accent)",
          color: "white",
        }}
      >
        {useEnglish ? "Back to home" : "홈으로 돌아가기"}
      </Link>
    </div>
  );
}
