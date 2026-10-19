"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TAROT_CARDS } from "@/lib/tarot-cards";
import { getInterpretation } from "@/lib/tarot-interpretation";
import { TAROT_TOPICS, parseTopic } from "@/lib/tarot";

const sectionTitle = "font-title text-base text-brand";
const bodyText = "m-0 text-sm leading-relaxed text-[#6B4A58]";

export function ResultClient() {
  const params = useSearchParams();
  const topicId = parseTopic(params.get("topic"));
  const topicLabel = TAROT_TOPICS.find((t) => t.id === topicId)!.label;
  const cardParam = params.get("card");
  const card = cardParam === null ? undefined : TAROT_CARDS[Number(cardParam)];
  const reversed = params.get("rev") === "1";

  if (!card) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="m-0 text-ink-sub">카드를 찾지 못했어요. 다시 뽑아볼까요?</p>
        <Link href="/tarot" className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline">
          타로 다시 보기
        </Link>
      </div>
    );
  }

  const r = getInterpretation(card.id, reversed, topicId);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="h-[226px] w-[132px] shrink-0 rounded-[14px] border-[3px] border-badge bg-white p-1.5 shadow-[0_10px_22px_rgba(120,20,60,0.18)]">
          <div className="flex size-full flex-col items-center gap-1 border-[1.5px] border-[#2B2B2B] bg-[#F4EEDC] p-1 font-serif text-[#2B2B2B]">
            <span className="text-[13px] tracking-[1px]">{card.numeral}</span>
            <div
              role="img"
              aria-label={`${card.ko} 카드 원본 이미지 자리`}
              className={`flex w-full flex-1 items-center justify-center border border-[#2B2B2B] bg-[repeating-linear-gradient(45deg,#EDE4CC_0_6px,#F4EEDC_6px_12px)] p-1 text-center font-body text-[11px] leading-snug text-[#6B5B3E] ${
                reversed ? "rotate-180" : ""
              }`}
            >
              <span className={reversed ? "rotate-180" : ""}>
                1909 원본
                <br />
                카드 이미지
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[1.5px]">{card.en}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg bg-brand px-2 py-[3px] text-xs text-white">
              {reversed ? "역방향" : "정방향"}
            </span>
            <span className="text-[13px] text-ink-sub">
              {card.ko} · {card.numeral}
            </span>
          </div>
          <h1 className="m-0 whitespace-pre-line font-title text-2xl font-normal leading-snug">{r.headline}</h1>
          <div className="flex flex-wrap gap-1">
            {r.keywords.map((k) => (
              <span key={k} className="rounded-xl bg-white px-2.5 py-[5px] text-xs text-[#A61E4D]">
                #{k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-1.5 rounded-3xl bg-white px-[18px] py-4">
        <span className={sectionTitle}>카드의 의미</span>
        <p className={bodyText}>{r.meaning}</p>
        <div className="my-1 h-px bg-[#F8D4E1]" />
        <span className={sectionTitle}>{topicLabel} 고민에서는</span>
        <p className={bodyText}>{r.topicReading}</p>
      </section>

      <section className="flex items-start gap-3 rounded-3xl bg-[#FFF7D6] px-[18px] py-4">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
          <path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z" fill="#F59F00" />
        </svg>
        <div className="flex flex-col gap-1">
          <span className="font-title text-base text-[#8A5A00]">콩닥 한마디</span>
          <p className="m-0 text-sm leading-relaxed text-[#6B4A2B]">{r.advice}</p>
        </div>
      </section>

      <Link
        href="/love"
        className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3 text-ink no-underline"
      >
        <span className="text-sm">올해 나의 연애운도 궁금하다면?</span>
        <span className="font-title text-sm text-brand">연애운 보기 ›</span>
      </Link>

      <div className="mt-auto flex flex-col gap-2.5">
        <p className="m-0 text-center text-[13px] text-ink-sub">오늘의 무료 카드를 뽑았어요 · 내일 또 만나요</p>
        <p className="m-0 text-center text-xs text-ink-mute">재미와 참고를 위한 콘텐츠예요</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="h-14 flex-1 rounded-[28px] border-2 border-brand bg-white font-title text-[17px] text-brand"
          >
            저장하기
          </button>
          <Link
            href="/compat"
            className="flex h-14 flex-[1.8] items-center justify-center gap-1.5 rounded-[28px] bg-brand font-title text-[17px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
          >
            그 사람과 궁합 보기
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
