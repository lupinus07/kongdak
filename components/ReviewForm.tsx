"use client";

import { useActionState, useState } from "react";
import { inputCls } from "@/components/form";
import { Heart, Hearts } from "@/components/icons/Heart";
import type { Product } from "@/lib/products";
import { submitReview, type ReviewState } from "@/lib/review-actions";
import { COMMENT_MAX, NICKNAME_MAX } from "@/lib/review-limits";

const LABELS = ["", "아쉬워요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

/** 유료 풀이 결과 맨 아래 후기 입력란: 하트 5개(필수) + 한 줄 후기·닉네임(선택). */
export function ReviewForm({
  product,
  done,
}: {
  product: Product;
  /** 이미 남긴 후기가 있으면 입력란 대신 고맙다는 인사를 보여준다 */
  done?: { rating: number; comment: string | null } | null;
}) {
  // 결과 링크 값은 화면 데이터에 따로 싣지 않고, 보낼 때 주소창에서 읽어 넘긴다
  const [state, formAction, pending] = useActionState(
    (_prev: ReviewState, formData: FormData) =>
      submitReview(new URLSearchParams(location.search).get("t") ?? "", product, formData),
    {},
  );
  const [rating, setRating] = useState(0);

  if (done || state.ok) {
    const r = done?.rating ?? rating;
    return (
      <section className="flex flex-col items-center gap-2 rounded-[26px] bg-white px-[18px] py-5 text-center">
        <Hearts rating={r} size={22} />
        <b className="font-title text-lg font-normal text-brand">후기 남겨 줘서 고마워요!</b>
        <p className="m-0 text-[14px] text-ink-sub">다른 분들이 풀이를 고를 때 큰 도움이 돼요.</p>
      </section>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-[26px] bg-white px-[18px] py-5">
      <div className="flex flex-col items-center gap-1 text-center">
        <b className="font-title text-lg font-normal text-ink">풀이는 어떠셨어요?</b>
        <span className="text-[14px] text-ink-sub">하트를 눌러 알려 주세요</span>
      </div>
      <div className="flex justify-center gap-1" role="radiogroup" aria-label="만족도">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`하트 ${n}개, ${LABELS[n]}`}
            onClick={() => setRating(n)}
            className="flex size-11 items-center justify-center rounded-full"
          >
            <Heart size={34} fill={n <= rating ? "#FF6B9A" : "#F3C6D6"} />
          </button>
        ))}
      </div>
      <span className="h-4 text-center font-title text-sm text-brand">{LABELS[rating]}</span>
      <input type="hidden" name="rating" value={rating || ""} />
      <input
        name="comment"
        maxLength={COMMENT_MAX}
        placeholder="한 줄 후기 (선택)"
        className={inputCls}
        aria-label="한 줄 후기"
      />
      <input
        name="nickname"
        maxLength={NICKNAME_MAX}
        placeholder="닉네임 (선택, 실명은 피해 주세요)"
        className={inputCls}
        aria-label="닉네임"
      />
      {state.error && <p className="m-0 text-center text-[14px] text-[#C92A2A]">{state.error}</p>}
      <button
        type="submit"
        disabled={!rating || pending}
        className="h-[52px] rounded-[26px] bg-brand font-title text-[17px] text-white disabled:bg-[#E8A5BC]"
      >
        {pending ? "남기는 중…" : "후기 남기기"}
      </button>
      <p className="m-0 text-center text-[12.5px] leading-relaxed text-[#8C6A78]">
        후기는 닉네임 첫 글자만 보이게 가려서 콩닥 화면에 소개될 수 있어요.
      </p>
    </form>
  );
}
