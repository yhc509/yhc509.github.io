import type { NextConfig } from "next";
import { previewDeploymentOrigin } from "./src/lib/previewBuild.mjs";

const previewOrigin = previewDeploymentOrigin();

const nextConfig: NextConfig = {
  output: "export",
  basePath: "",
  ...(previewOrigin ? { assetPrefix: previewOrigin } : {}),
  images: {
    unoptimized: true,
  },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
