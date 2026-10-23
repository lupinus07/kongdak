import Link from "next/link";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ResultLinkBox } from "@/components/ResultLinkBox";
import { Disclaimer, Skeleton } from "@/components/report";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("우리의 궁합");

const CARDS = [
  { title: "잘 맞는 점", bg: "#FFE3EC", stroke: "#C2255C", icon: "M5 12l5 5L20 7" },
  { title: "살짝 조심할 점", bg: "#FFF1DE", stroke: "#C25A00", icon: "M12 7v6M12 17v.5" },
  {
    title: "더 가까워지는 팁",
    bg: "#E3F4E1",
    stroke: "#2B6B2A",
    icon: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  },
];

// TODO: ?t= 결과 링크로 주문을 확인하고(lib/orders-server.ts) readings에서 풀이를 불러온다. 지금은 레이아웃만 보여준다.
export default function CompatResultPage() {
  return (
    <PhoneFrame>
      <BackHeader title="우리의 궁합" href="/" />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pb-6 pt-2">
        <Suspense>
          <ResultLinkBox product="compat" />
        </Suspense>
        <section className="flex flex-col items-center gap-2.5 rounded-[32px] bg-white px-5 py-[22px] shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
          <div className="relative size-[168px]">
            <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
              <circle cx="84" cy="84" r="70" fill="none" stroke="#FFE3EC" strokeWidth="16" />
              <circle
                cx="84"
                cy="84"
                r="70"
                fill="none"
                stroke="#FF6B9A"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="383 440"
                transform="rotate(-90 84 84)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] text-ink-sub">콩닥지수</span>
              <span className="font-title text-[52px] leading-none text-brand">
                87<span className="text-2xl">%</span>
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-2" aria-hidden="true">
            <div className="h-6 w-3/4 rounded-lg bg-[#F6DCE5]" />
            <div className="h-6 w-1/2 rounded-lg bg-[#F6DCE5]" />
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-7 w-20 rounded-[14px] bg-bg" />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2.5">
          {CARDS.map((c) => (
            <div key={c.title} className="flex items-start gap-3 rounded-[22px] bg-white px-4 py-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: c.bg }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={c.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={c.icon} />
                </svg>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <span className="font-title text-base">{c.title}</span>
                <Skeleton lines={3} />
              </div>
            </div>
          ))}
        </div>

        <Disclaimer>재미와 참고를 위한 콘텐츠예요.</Disclaimer>

        <div className="mt-auto flex gap-2.5">
          <button
            type="button"
            className="h-14 flex-1 rounded-[28px] border-2 border-brand bg-white font-title text-[17px] text-brand"
          >
            공유하기
          </button>
          <Link
            href="/"
            className="flex h-14 flex-[1.4] items-center justify-center rounded-[28px] bg-brand font-title text-[17px] text-white no-underline"
          >
            홈으로
          </Link>
        </div>
      </main>
    </PhoneFrame>
  );
}
