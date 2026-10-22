"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TAROT_TOPICS, TAROT_TOPIC_QUESTIONS, type TarotTopicId } from "@/lib/tarot";
import { TAROT_CARDS } from "@/lib/tarot-cards";
import { drawResultHref, getTodayDraw, type DailyDraw } from "@/lib/tarot-daily";

const line = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#C2255C",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const icons: Record<TarotTopicId, React.ReactNode> = {
  crush: (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
    </svg>
  ),
  their_heart: (
    <svg {...line}>
      <path d="M4 12c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  some: (
    <svg {...line}>
      <path d="M4 17c3 0 4-10 8-10s5 10 8 10" />
    </svg>
  ),
  breakup: (
    <svg {...line}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
      <path d="M12 7.4l-1.5 4 3 1.5-1.5 4" />
    </svg>
  ),
  confess: (
    <svg {...line}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </svg>
  ),
};

export function TarotAskForm() {
  const [topic, setTopic] = useState<TarotTopicId>("crush");
  const [worry, setWorry] = useState("");
  // undefined: 아직 확인 전. 이미 뽑은 날에 고민 선택 화면이 잠깐 보였다 바뀌지 않도록 확인 뒤에 그린다.
  const [today, setToday] = useState<DailyDraw | null | undefined>(undefined);
  useEffect(() => {
    // localStorage는 마운트 뒤에만 읽을 수 있다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(getTodayDraw());
  }, []);

  if (today === undefined) return null;
  if (today) return <TodayCard draw={today} />;

  return (
    <>
      <Heading title={["요즘 어떤 고민이", "있어요?"]} sub="고민을 고르면 카드가 답해줄게요" />
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="고민 선택">
        {TAROT_TOPICS.map((t, i) => {
          const on = t.id === topic;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setTopic(t.id)}
              className={`flex h-16 items-center gap-2.5 rounded-[20px] border-2 bg-white px-3.5 text-left font-title text-base ${
                i === TAROT_TOPICS.length - 1 ? "col-span-2" : ""
              } ${on ? "border-brand text-brand" : "border-transparent text-ink"}`}
            >
              {icons[t.id]}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <label htmlFor="worry" className="font-title text-base text-brand">
          조금 더 자세히 적어볼까요? (선택)
        </label>
        <textarea
          id="worry"
          rows={4}
          value={worry}
          onChange={(e) => setWorry(e.target.value)}
          placeholder="예) 같은 동아리 선배인데, 나한테만 유독 다정한 것 같아요. 그 사람도 날 좋아할까요?"
          className="resize-none rounded-2xl border-none bg-bg px-3.5 py-3 text-[15px] leading-normal text-ink placeholder:text-[#B88A9C]"
        />
      </div>

      <Link
        href={`/tarot/draw?topic=${topic}`}
        className="mt-auto flex h-[58px] items-center justify-center gap-2 rounded-[29px] bg-brand font-title text-[19px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
      >
        카드 뽑으러 가기
        <Arrow />
      </Link>
    </>
  );
}

function Heading({ title, sub }: { title: [string, string]; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="m-0 font-title text-[28px] font-normal leading-tight">
        {title[0]}
        <br />
        {title[1]}
      </h1>
      <p className="m-0 text-[15px] text-ink-sub">{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** 오늘 이미 무료 카드를 뽑았으면 고민 선택 대신 그 카드를 보여주고 결과로 바로 보낸다. */
function TodayCard({ draw }: { draw: DailyDraw }) {
  const card = TAROT_CARDS[draw.card];
  const topicLabel = TAROT_TOPICS.find((t) => t.id === draw.topic)!.label;
  return (
    <>
      <Heading title={["오늘의 카드가", "기다리고 있어요"]} sub="오늘 뽑은 카드의 풀이를 다시 볼 수 있어요" />
      <Link
        href={drawResultHref(draw)}
        className="flex items-center gap-4 rounded-3xl bg-white p-4 text-ink no-underline shadow-[0_8px_24px_rgba(194,37,92,0.10)]"
      >
        <div className="w-[76px] shrink-0 rounded-[10px] border-[3px] border-badge bg-white p-[3px]">
          <Image
            src={`/tarot/${String(card.id).padStart(2, "0")}.webp`}
            alt={`${card.ko} 카드${draw.reversed ? " (역방향)" : ""}`}
            width={600}
            height={1006}
            unoptimized
            className={`block h-auto w-full rounded-md ${draw.reversed ? "rotate-180" : ""}`}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="self-start rounded-lg bg-badge px-2 py-[3px] text-xs text-ink">오늘 뽑은 카드</span>
          <b className="font-title text-xl font-normal">
            {card.ko} · {draw.reversed ? "역방향" : "정방향"}
          </b>
          <span className="text-[13px] text-ink-sub">
            {topicLabel} · {TAROT_TOPIC_QUESTIONS[draw.topic]}
          </span>
        </div>
      </Link>
      <p className="m-0 text-center text-[13px] text-ink-sub">오늘의 무료 카드는 하루 한 장이에요. 내일 또 만나요</p>
      <Link
        href={drawResultHref(draw)}
        className="mt-auto flex h-[58px] items-center justify-center gap-2 rounded-[29px] bg-brand font-title text-[19px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
      >
        오늘의 풀이 다시 보기
        <Arrow />
      </Link>
    </>
  );
}
