"use client";

import { useActionState } from "react";
import { answerInquiry, type AnswerState } from "@/lib/inquiry-actions";
import { ANSWER_MAX } from "@/lib/inquiry-shared";

/** 문의 하나에 답변 쓰기. 이미 답했으면 고쳐 쓸 수 있다. */
export function AnswerForm({ id, answer }: { id: string; answer: string | null }) {
  const [state, action, pending] = useActionState<AnswerState, FormData>(answerInquiry, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="answer"
        rows={3}
        maxLength={ANSWER_MAX}
        defaultValue={answer ?? ""}
        placeholder="답변을 적으면 문의한 사람이 '답변 확인하기'에서 볼 수 있어요"
        className="resize-y rounded-2xl border-2 border-[#F3C6D6] bg-white px-3.5 py-2.5 text-[14.5px] leading-normal outline-none focus:border-brand"
      />
      <div className="flex items-center justify-end gap-2.5">
        {state.error && <span className="text-[13.5px] text-brand">{state.error}</span>}
        {state.ok && !pending && <span className="text-[13.5px] text-[#2B6B2A]">저장했어요</span>}
        <button type="submit" disabled={pending} className="rounded-[18px] bg-brand px-4 py-2 font-title text-[15px] text-white disabled:opacity-50">
          {pending ? "저장 중…" : answer ? "답변 고치기" : "답변 저장"}
        </button>
      </div>
    </form>
  );
}
