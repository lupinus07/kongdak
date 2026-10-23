"use client";

import { useEffect, useState } from "react";
import { Chap, H, P, Sec } from "@/components/report";
import { SajuChart } from "@/components/SajuChart";
import { checkBirthDate } from "@/lib/birth";
import type { Saju } from "@/lib/saju";
import { SajuCards } from "@/components/SajuCards";
import type { Situation } from "@/lib/saju-reading";

/** 결제 전 무료 미리보기. 사주 원국은 만세력 계산이라 AI 비용이 없어 브라우저에서 바로 그린다. 나머지 챕터는 잠가 둔다. */

/** 상황별로 잠긴 1년 흐름 챕터에 거는 질문. 결제 후 AI 풀이에서 실제로 다루는 내용과 맞춘다. */
const FLOW_TEASER: Record<Situation, string> = {
  솔로: "인연 기운이 들어오는 달은 언제일까요?",
  썸: "마음을 전하기 좋은 달은 언제일까요?",
  "연애 중": "우리 관계가 더 깊어지는 달은 언제일까요?",
  "이별 후": "마음이 정리되고 새 인연이 다가오는 때는 언제일까요?",
};

const LOCKED = [
  { label: "CHAPTER 2", title: "나의 연애 DNA" },
  { label: "CHAPTER 3", title: "연애할 때의 나" },
  { label: "CHAPTER 4", title: "이성 인연" },
  { label: "CHAPTER 5", title: "나와 잘 맞는 사람" },
  { label: "CHAPTER 6", title: "연애할 때 조심할 점" },
];

/** 블러 아래 깔리는 자리 채움 문장. 실제 풀이가 아니라 읽혀도 의미가 없게 둔다. */
const FILLER = "내 사주로 읽는 연애 이야기가 이 자리에 들어가요. 결제하면 나만을 위한 풀이로 채워져요.";

function Blurred({ lines = 2 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none blur-[5px]">
      {Array.from({ length: lines }, (_, i) => (
        <P key={i}>{FILLER}</P>
      ))}
    </div>
  );
}

function Lock() {
  return (
    <span className="rounded-xl bg-[#FFF0F5] px-2.5 py-[3px] text-[11.5px] text-brand">🔒 결제 후 열려요</span>
  );
}

export function SajuPreview({
  birth,
  calendar,
  time,
  situation,
  gender,
}: {
  birth: string;
  calendar: string;
  time: string;
  situation: Situation;
  gender: string;
}) {
  const ready = checkBirthDate(birth) === "ok";
  const [saju, setSaju] = useState<Saju | null>(null);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    // 만세력 라이브러리는 용량이 커서 생년월일이 다 입력됐을 때만 불러온다
    import("@/lib/saju").then(({ calcSaju }) => {
      if (alive) setSaju(calcSaju({ birth, calendar, time }));
    });
    return () => {
      alive = false;
    };
  }, [ready, birth, calendar, time]);

  if (!ready || !saju) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <Sec>
        <div className="flex items-center justify-between">
          <Chap>CHAPTER 1</Chap>
          <span className="rounded-xl bg-badge px-2.5 py-[3px] text-[11.5px] text-ink">무료 미리보기</span>
        </div>
        <H>나의 사주 원국</H>
        <SajuChart saju={saju} />
        <SajuCards saju={saju} situation={situation} gender={gender} />
        <p className="m-0 text-xs text-ink-sub">태어난 시간은 표준시 기준으로 계산했어요.</p>
      </Sec>

      {LOCKED.map((c) => (
        <Sec key={c.label}>
          <div className="flex items-center justify-between">
            <Chap>{c.label}</Chap>
            <Lock />
          </div>
          <H>{c.title}</H>
          <Blurred />
        </Sec>
      ))}

      <Sec>
        <div className="flex items-center justify-between">
          <Chap>CHAPTER 7</Chap>
          <Lock />
        </div>
        <H>{FLOW_TEASER[situation]}</H>
        <div aria-hidden="true" className="pointer-events-none grid select-none grid-cols-3 gap-1.5 blur-[4px]">
          {["♥♥", "♥", "♥♥♥", "♥", "♥♥", "♥"].map((mark, i) => (
            <div key={i} className="flex flex-col gap-1 rounded-2xl bg-[#FFF8FA] px-2 py-2.5 text-xs text-[#5E3F4C]">
              <b className="font-title text-[13px] font-normal text-brand">{mark}</b>
              이 달의 연애 흐름
            </div>
          ))}
        </div>
      </Sec>
    </div>
  );
}
