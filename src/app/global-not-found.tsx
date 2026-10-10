import { NotFoundView } from "@/components/NotFoundView";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <NotFoundView language="en" />
      </body>
    </html>
  );
}
