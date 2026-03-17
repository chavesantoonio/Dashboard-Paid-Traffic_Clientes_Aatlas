import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix workspace root detection when multiple lockfiles are present
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
