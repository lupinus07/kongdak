import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 공유 링크 미리보기 그림(next/og)이 읽는 카드 사본을 서버 함수에 함께 담는다
  outputFileTracingIncludes: {
    "/tarot/share/**": ["./assets/tarot-og/**"],
    "/opengraph-image": ["./app/icon.png"],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
