import Link from "next/link";
import { Suspense } from "react";
import { Heart } from "@/components/icons/Heart";
import { CoupleHero, CoupleSmall, SoloSparkle } from "@/components/icons/Characters";
import { MenuButton } from "@/components/MenuButton";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ReviewStrip } from "@/components/ReviewStrip";
import { BusinessFooter } from "@/components/BusinessFooter";
import { TabBar } from "@/components/TabBar";
import { PRODUCTS } from "@/lib/products";

export const metadata = { alternates: { canonical: "/" } };

const priceBadge = "whitespace-nowrap rounded-[10px] bg-bg px-2 py-1 font-title text-[13px] text-brand";
const sampleChip =
  "pointer-events-auto whitespace-nowrap rounded-[10px] border border-brand/30 bg-white px-2 py-1 font-title text-[13px] text-brand no-underline";
const miniCard =
  "relative flex h-[188px] flex-col gap-1.5 rounded-[26px] bg-white p-4 text-ink no-underline shadow-[0_8px_20px_rgba(194,37,92,0.10)]";

export default function Home() {
  return (
    <PhoneFrame>
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-3 pt-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart />
            <span className="font-title text-[28px] text-brand">콩닥</span>
          </div>
          <MenuButton />
        </header>

        <section className="flex flex-col items-center gap-1.5 text-center">
          <CoupleHero />
          <h1 className="m-0 font-title text-[30px] font-normal leading-tight">
            우리 사이,
            <br />
            콩닥콩닥할까?
          </h1>
          <p className="m-0 font-title text-[18px] text-brand">카드와 사주로 보는 우리 이야기</p>
        </section>

        <Link
          href="/tarot"
          className="relative flex h-[226px] flex-col gap-2 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#E64980] to-brand p-5 pt-[22px] text-white no-underline shadow-[0_14px_28px_rgba(194,37,92,0.30)]"
        >
          <span className="self-start rounded-xl bg-badge px-[11px] py-[5px] text-[13.5px] text-[#5C3D00]">
            오늘 1장 무료 · 가입 없이
          </span>
          <span className="max-w-[190px] font-title text-[26px] leading-tight">
            타로로
            <br />
            고민 물어보기
          </span>
          <span className="max-w-[180px] text-[14px] leading-normal text-[#FFE3EC]">
            짝사랑 · 속마음 · 재회
            <br />
            고백 타이밍까지
          </span>
          <span className="mt-auto flex h-10 items-center gap-1.5 self-start rounded-[20px] bg-white px-4 font-title text-base text-brand">
            카드 뽑기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          <div aria-hidden="true" className="absolute right-3.5 top-[42px] h-[150px] w-[140px]">
            <div className="card-back" style={{ left: 40, top: 20, transform: "rotate(-18deg)" }} />
            <div className="card-back" style={{ left: 40, top: 20, transform: "rotate(18deg)" }} />
            <div className="card-back" style={{ left: 40, top: 6, borderColor: "#FFD43B" }} />
            <svg width="26" height="26" viewBox="0 0 24 24" className="absolute left-[58px] top-10">
              <path d="M12 2l2.4 7.1L22 12l-7.6 2.9L12 22l-2.4-7.1L2 12l7.6-2.9z" fill="#FFFFFF" />
            </svg>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <div className={miniCard}>
            <CoupleSmall />
            <span className="font-title text-xl">둘의 궁합</span>
            <span className="text-[14px] leading-snug text-ink-sub">
              우리 둘,
              <br />
              얼마나 잘 맞을까?
            </span>
            <div className="pointer-events-none relative z-10 mt-auto flex items-center gap-1">
              <span className={priceBadge}>{PRODUCTS.compat.price.toLocaleString()}원</span>
            </div>
            <Link href="/compat" aria-label="둘의 궁합 시작하기" className="absolute inset-0 rounded-[26px]" />
          </div>
          <div className={miniCard}>
            <SoloSparkle />
            <span className="font-title text-xl">나의 연애운</span>
            <span className="text-[14px] leading-snug text-ink-sub">
              올해 내 연애,
              <br />
              어떻게 흘러갈까?
            </span>
            <div className="pointer-events-none relative z-10 mt-auto flex items-center gap-1">
              <Link href="/love" className={sampleChip}>
                무료보기
              </Link>
              <span className={priceBadge}>{PRODUCTS.love.price.toLocaleString()}원</span>
            </div>
            <Link href="/love" aria-label="나의 연애운 시작하기" className="absolute inset-0 rounded-[26px]" />
          </div>
        </div>

        <p className="m-0 text-center text-[13px] text-ink-sub">
          샘플 풀이 둘러보기{" "}
          <Link href="/compat/sample" className="text-ink-sub underline">
            궁합
          </Link>
          {" · "}
          <Link href="/love/sample" className="text-ink-sub underline">
            연애운
          </Link>
        </p>

        <Suspense fallback={null}>
          <ReviewStrip />
        </Suspense>
      </main>
      <BusinessFooter />
      <TabBar />
    </PhoneFrame>
  );
}
