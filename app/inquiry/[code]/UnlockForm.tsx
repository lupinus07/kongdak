"use client";

import { useActionState, useState } from "react";
import { inputCls } from "@/components/form";
import { openInquiry, type OpenState } from "@/lib/inquiry-actions";
import type { InquiryDetail } from "@/lib/inquiry-shared";
import { InquiryView } from "../InquiryView";

/** 비밀글 열기: 문의할 때 정한 비밀번호를 넣으면 내용과 답변을 보여준다. */
export function UnlockForm({ code, category, date }: { code: string; category: string; date: string }) {
  const [state, action, pending] = useActionState<OpenState, FormData>(openInquiry.bind(null, code), {});
  const [password, setPassword] = useState("");
  const q: InquiryDetail | undefined = state.inquiry;
  if (q) return <InquiryView q={q} />;

  return (
    <form action={action} className="flex flex-col items-center gap-3 rounded-[26px] bg-white px-4 py-6 text-center">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <b className="font-title text-[19px] font-normal text-ink">비밀글이에요</b>
      <span className="text-[13.5px] text-ink-sub">
        {category} 문의 · {date}
      </span>
      <input
        type="password"
        name="password"
        aria-label="비밀번호"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="문의할 때 정한 비밀번호"
        className={`${inputCls} mt-1 text-center`}
      />
      {state.error && <p className="m-0 text-[14px] text-[#C92A2A]">{state.error}</p>}
      <button type="submit" disabled={pending} className="h-[52px] w-full rounded-[26px] bg-brand font-title text-[17px] text-white disabled:opacity-60">
        {pending ? "확인 중…" : "확인"}
      </button>
    </form>
  );
}
