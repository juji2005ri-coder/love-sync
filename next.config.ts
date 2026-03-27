import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 開発中のため、ビルド時の型チェックを一時的にスキップします。
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
