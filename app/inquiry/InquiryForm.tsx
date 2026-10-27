"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { inputCls, labelCls } from "@/components/form";
import { createInquiry, type CreateState } from "@/lib/inquiry-actions";
import { INQUIRY_CATEGORIES, INQUIRY_MAX, type InquiryCategory } from "@/lib/inquiry-shared";

const PLACEHOLDER: Record<InquiryCategory, string> = {
  환불: "예) 결제했는데 아직 풀이를 열지 않았어요. 환불하고 싶어요.",
  결제: "예) 결제는 됐는데 결과 화면이 나오지 않아요.",
  "풀이 오류": "예) 풀이를 여는데 계속 기다리는 화면만 나와요.",
  기타: "궁금한 점을 편하게 적어 주세요.",
};

/** 1:1 문의 입력. 답변은 문의번호 + 휴대폰 뒷자리로 사이트에서 확인한다(연락처를 따로 받지 않는다). */
export function InquiryForm() {
  const [state, action, pending] = useActionState<CreateState, FormData>(createInquiry, {});
  const [category, setCategory] = useState<InquiryCategory>("환불");
  // 폼을 보내면 입력칸이 비워지므로, 오류가 나도 다시 쓰지 않게 값을 직접 들고 있는다
  const [content, setContent] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [last4, setLast4] = useState("");

  if (state.code) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-[26px] bg-white px-5 py-7 text-center">
        <b className="font-title text-[22px] font-normal text-brand">문의가 접수됐어요</b>
        <p className="m-0 text-[15px] leading-relaxed text-ink-sub">
          확인하는 대로 답변을 남길게요.
          <br />
          아래 문의번호를 꼭 저장해 두세요.
        </p>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-bg px-6 py-3">
          <span className="text-[13px] text-ink-sub">문의번호</span>
          <b className="font-title text-[26px] font-normal tracking-[2px] text-ink">{state.code}</b>
        </div>
        <p className="m-0 text-[13.5px] leading-relaxed text-ink-sub">
          답변은 ‘답변 확인하기’에서 문의번호와 휴대폰 뒷자리로 볼 수 있어요.
        </p>
        <Link
          href="/inquiry/check"
          className="mt-1 flex h-[52px] w-full items-center justify-center rounded-[26px] bg-brand font-title text-[17px] text-white no-underline"
        >
          답변 확인하기
        </Link>
      </section>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-title text-[26px] font-normal leading-tight">무엇을 도와드릴까요?</h1>
        <p className="m-0 text-[15px] text-ink-sub">남겨 주시면 확인하는 대로 답변드려요.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <span className={labelCls}>문의 종류</span>
        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="문의 종류">
          {INQUIRY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === category}
              onClick={() => setCategory(c)}
              className={`h-11 rounded-[16px] border-2 text-[14px] ${
                c === category ? "border-brand bg-[#FFF0F5] font-title text-brand" : "border-transparent bg-bg text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />

        <label htmlFor="content" className={labelCls}>
          문의 내용
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          maxLength={INQUIRY_MAX}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={PLACEHOLDER[category]}
          className={`${inputCls} h-auto resize-none py-3 leading-normal`}
        />
        <span className="-mt-2 self-end text-xs text-ink-sub">
          {content.length}/{INQUIRY_MAX}
        </span>

        <label htmlFor="orderCode" className={labelCls}>
          주문번호 <span className="text-sm text-ink-sub">(선택)</span>
        </label>
        <input
          id="orderCode"
          name="orderCode"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          maxLength={8}
          autoCapitalize="characters"
          placeholder="결제 관련이면 적어 주세요 (예: 55B1378B)"
          className={`${inputCls} uppercase placeholder:normal-case`}
        />

        <label htmlFor="phoneLast4" className={labelCls}>
          휴대폰 번호 뒷자리
        </label>
        <input
          id="phoneLast4"
          name="phoneLast4"
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
          placeholder="숫자 4자리"
          className={inputCls}
        />
        <p className="m-0 -mt-1.5 text-xs text-ink-sub">답변을 확인할 때 문의번호와 함께 써요.</p>

        {/* 봇 차단용 숨은 칸 */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>

      {state.error && <p className="m-0 text-center text-[14px] text-[#C92A2A]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-[58px] rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)] disabled:opacity-60"
      >
        {pending ? "보내는 중…" : "문의 남기기"}
      </button>
      <Link href="/inquiry/check" className="text-center text-[14px] text-brand no-underline">
        이미 문의했다면 답변 확인하기 ›
      </Link>
    </form>
  );
}
