import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This artifact is its own npm app inside a larger workspace; pin the trace
  // root so Next doesn't pick up the monorepo's pnpm lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname),
};

export default nextConfig;
