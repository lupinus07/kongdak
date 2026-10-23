"use client";

import { useEffect, useState } from "react";

const LOVE_STEPS = [
  "사주 원국을 읽고 있어요",
  "연애 DNA를 풀어 쓰고 있어요",
  "연애할 때의 나를 정리하고 있어요",
  "이성 인연을 살펴보고 있어요",
  "잘 맞는 사람을 찾고 있어요",
  "다가오는 1년 흐름을 짚고 있어요",
  "마지막으로 한마디를 다듬고 있어요",
];
const STEP_MS = 7000;

/** 둘의 궁합 풀이 단계 */
export const COMPAT_STEPS = [
  "두 사람의 사주 원국을 읽고 있어요",
  "서로 채워 주는 기운을 찾고 있어요",
  "두 사람의 마음 궁합을 보고 있어요",
  "서로를 잇는 자리를 살펴보고 있어요",
  "잘 맞는 점을 정리하고 있어요",
  "조심할 점을 다정하게 쓰고 있어요",
  "더 가까워지는 팁을 고르고 있어요",
];

/** 풀이를 만드는 동안 단계 문구를 순서대로 보여준다. 끝 단계에 닿으면 거기서 머문다. */
export function WaitingSteps({ steps = LOVE_STEPS }: { steps?: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), STEP_MS);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
      <b className="font-title text-base font-normal text-brand">{steps[i]}…</b>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((_, n) => (
          <span key={n} className={`size-2 rounded-full ${n <= i ? "bg-brand" : "bg-[#F3C6D6]"}`} />
        ))}
      </div>
    </div>
  );
}
