"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PayButton } from "@/components/PayButton";
import { isDraftReady, loadOrderDraft, type LoveDraft } from "@/lib/order-draft";
import { SajuPreview } from "../SajuPreview";
import type { Situation } from "@/lib/saju-reading";

/** 입력 화면에서 넘어온 입력값(브라우저 저장소)으로 무료 미리보기를 그리고, 하단에 990원 결제 버튼을 고정한다. */
export function LovePreview() {
  const [draft, setDraft] = useState<LoveDraft | null | undefined>(undefined);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 뒤에 불러온다
    const saved = loadOrderDraft("love");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(saved && saved.product === "love" && isDraftReady(saved) ? saved : null);
  }, []);

  if (draft === undefined) return null;

  if (draft === null) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-[22px] text-center">
        <p className="m-0 text-ink-sub">입력한 정보를 찾지 못했어요. 생년월일을 다시 입력해 주세요.</p>
        <Link href="/love" className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline">
          나의 연애운 보러 가기
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-6 pt-2">
      <SajuPreview
        birth={draft.birth}
        calendar={draft.calendar}
        time={draft.time}
        situation={draft.situation as Situation}
        gender={draft.gender}
      />
      <div className="sticky bottom-0 z-20 -mx-[18px] mt-auto bg-gradient-to-t from-bg from-80% to-transparent px-[18px] pb-4 pt-5">
        <PayButton label="나머지 풀이 보기" product="love" draft={draft} />
      </div>
    </main>
  );
}
