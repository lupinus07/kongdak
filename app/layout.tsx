import type { Metadata } from "next";
import { Jua, Gowun_Dodum, Noto_Serif_KR } from "next/font/google";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import { Suspense } from "react";
import { NavTracker } from "@/components/NavTracker";
import "./globals.css";

const jua = Jua({ weight: "400", variable: "--font-jua", display: "swap" });
const gowun = Gowun_Dodum({ weight: "400", variable: "--font-gowun", display: "swap" });
const notoSerifKr = Noto_Serif_KR({ weight: "600", variable: "--font-serif-kr", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // 페이지 제목 뒤에 " | 콩닥"이 붙는다. 제목이 없는 페이지(홈)는 default를 쓴다.
  title: { default: SITE_TITLE, template: "%s | 콩닥" },
  description: SITE_DESCRIPTION,
  applicationName: "콩닥",
  keywords: [
    "연애 타로", "무료 타로", "타로", "오늘의 타로", "짝사랑 타로", "속마음 타로", "썸 타로", "재회 타로",
    "이별 타로", "고백 타로", "사주", "사주 궁합", "궁합", "연애운", "올해 연애운", "연애 사주", "콩닥",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "콩닥",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  // 구글 서치 콘솔·네이버 서치어드바이저에서 받은 인증 코드를 버셀 환경변수에 넣으면 메타 태그가 붙는다.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowun.variable} ${notoSerifKr.variable}`}>
      <body>
        {children}
        <Suspense>
          <NavTracker />
        </Suspense>
      </body>
    </html>
  );
}
