import type { Metadata } from "next";
import { Jua, Gowun_Dodum, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const jua = Jua({ weight: "400", variable: "--font-jua", display: "swap" });
const gowun = Gowun_Dodum({ weight: "400", variable: "--font-gowun", display: "swap" });
const notoSerifKr = Noto_Serif_KR({ weight: "600", variable: "--font-serif-kr", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "콩닥 - 우리 사이, 콩닥콩닥할까?",
  description: "타로와 궁합, 연애운으로 보는 우리 이야기",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowun.variable} ${notoSerifKr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
