import type { NextConfig } from "next";

// Static export so the app can be hosted on GitHub Pages (or any static host).
// Set NEXT_PUBLIC_BASE_PATH when the site is served from a sub-path,
// e.g. NEXT_PUBLIC_BASE_PATH=/claude for https://<user>.github.io/claude/
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Emit dashboard/index.html rather than dashboard.html. Static hosts like
  // GitHub Pages only resolve a directory URL ("/dashboard/") to an index.html,
  // so without this every route 404s the moment a trailing slash is involved.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
