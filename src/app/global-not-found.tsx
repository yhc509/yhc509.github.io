import { NotFoundView } from "@/components/NotFoundView";
import { isVercelBuild } from "@/lib/site";
import "./globals.css";

export default function GlobalNotFound() {
  if (isVercelBuild()) {
    return (
      <html lang="en">
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body className="antialiased min-h-screen">
          <NotFoundView language="en" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <NotFoundView language="en" />
      </body>
    </html>
  );
}
