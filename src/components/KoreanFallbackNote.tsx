export function KoreanFallbackNote({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) {
    return null;
  }

  return <p className="language-fallback-note">{message}</p>;
}
