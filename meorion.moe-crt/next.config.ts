import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    reactStrictMode: true,
    allowedDevOrigins: ["127.0.0.1", "localhost"],
    devIndicators: false,
    poweredByHeader: false,
};

export default nextConfig;
