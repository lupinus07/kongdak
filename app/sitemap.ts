import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** 검색엔진에 알려 줄 주요 페이지. 네이버 서치어드바이저·구글 서치 콘솔에 이 주소(/sitemap.xml)를 제출한다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/tarot", 0.9],
    ["/love", 0.8],
    ["/compat", 0.8],
    ["/love/sample", 0.5],
    ["/compat/sample", 0.5],
  ];
  return pages.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority }));
}
