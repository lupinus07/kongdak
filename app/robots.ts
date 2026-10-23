import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** 검색 로봇 안내. 결제·로그인·개인 결과·API는 수집하지 않게 한다. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/admin", "/payment", "/my", "/find", "/love/result", "/love/preview", "/compat/result", "/tarot/result", "/tarot/draw"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
