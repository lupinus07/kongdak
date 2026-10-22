import type { Metadata } from "next";

/** 사이트 주소. 정식 도메인을 연결하면 NEXT_PUBLIC_SITE_URL에 넣는다. 없으면 버셀 운영 주소, 로컬은 localhost. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/** 검색 결과·메신저 미리보기에 쓰는 기본 문구. 검색어(연애 타로, 사주 궁합, 연애운 등)를 자연스럽게 담는다. */
export const SITE_TITLE = "콩닥 - 무료 연애 타로 · 사주 궁합 · 연애운";
export const SITE_DESCRIPTION =
  "짝사랑, 그 사람 속마음, 썸, 이별·재회, 고백 타이밍이 고민될 때 하루 한 장 무료 연애 타로를 뽑아 보세요. 생년월일 사주로 보는 둘의 궁합과 올해 나의 연애운도 콩닥에서 확인할 수 있어요.";

/** 검색에 노출할 페이지의 메타데이터. openGraph는 부모 값을 통째로 덮어써서 사이트 공통 값을 함께 넣는다. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "콩닥",
      title: `${title} | 콩닥`,
      description,
      url: path,
      // 사이트 기본 그림(app/opengraph-image.tsx). 자기 그림 파일이 있는 페이지(공유 페이지)는 그 파일이 우선한다.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE }],
    },
  } satisfies Metadata;
}

/** 로그인·결제·개인 결과처럼 검색에 나올 필요 없는 페이지 */
export function privateMetadata(title: string) {
  return { title, robots: { index: false, follow: false } } satisfies Metadata;
}
