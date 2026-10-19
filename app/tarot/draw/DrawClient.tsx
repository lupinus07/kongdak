"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { TAROT_TOPICS, TAROT_TOPIC_QUESTIONS, drawRandomCard, parseTopic } from "@/lib/tarot";

const ANGLES = [-24, -16, -8, 0, 8, 16, 24];

export function DrawClient() {
  const router = useRouter();
  const topicId = parseTopic(useSearchParams().get("topic"));
  const topicLabel = TAROT_TOPICS.find((t) => t.id === topicId)!.label;

  const [selected, setSelected] = useState<number | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  function confirm() {
    if (selected === null) return;
    const { card, reversed } = drawRandomCard();
    router.push(`/tarot/result?topic=${topicId}&card=${card}&rev=${reversed ? 1 : 0}`);
  }

  function shuffle() {
    setSelected(null);
    setShuffleKey((k) => k + 1);
  }

  return (
    <>
      <div className="flex items-center gap-1.5 self-center rounded-[18px] bg-white px-3.5 py-2 text-sm text-[#A61E4D]">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
        </svg>
        {topicLabel} · {TAROT_TOPIC_QUESTIONS[topicId]}
      </div>

      <div className="flex flex-col gap-1 text-center">
        <h1 className="m-0 font-title text-[26px] font-normal leading-snug">
          고민을 떠올리면서
          <br />
          마음이 가는 카드 한 장
        </h1>
        <p className="m-0 text-sm text-ink-sub">천천히 골라도 괜찮아요</p>
      </div>

      <div
        key={shuffleKey}
        role="radiogroup"
        aria-label="타로 카드 7장"
        className={`relative h-[330px] w-[346px] self-center ${shuffleKey > 0 ? "animate-[shuffle_0.5s_ease]" : ""}`}
      >
        {ANGLES.map((angle, i) => {
          const on = selected === i;
          return (
            <button
              key={angle}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${i + 1}번째 카드`}
              onClick={() => setSelected(i)}
              className="tarot-card"
              data-on={on}
              style={{
                transform: `rotate(${angle}deg)${on ? " translateY(-34px)" : ""}`,
                zIndex: on ? 10 : undefined,
              }}
            >
              {on && (
                <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#FFFFFF" />
                  <path d="M24 44s-9-5.8-9-12.6a5 5 0 0 1 9-3 5 5 0 0 1 9 3C33 38.2 24 44 24 44z" fill="#FF6B9A" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <button
          type="button"
          onClick={confirm}
          disabled={selected === null}
          className="flex h-[58px] items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)] disabled:bg-[#E3AFC2] disabled:shadow-none"
        >
          이 카드로 할게요
        </button>
        <button type="button" onClick={shuffle} className="h-11 text-sm text-[#A61E4D]">
          카드 다시 섞기
        </button>
      </div>
    </>
  );
}
