"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { inputCls, labelCls } from "@/components/form";
import { findInquiry, type FindState } from "@/lib/inquiry-actions";

const date = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/** 문의번호 + 휴대폰 뒷자리로 내 문의와 답변을 본다. */
export function CheckForm() {
  const [state, action, pending] = useActionState<FindState, FormData>(findInquiry, {});
  // 폼을 보내면 입력칸이 비워지므로, 한 번 틀려도 다시 쓰지 않게 값을 직접 들고 있는다
  const [code, setCode] = useState("");
  const [last4, setLast4] = useState("");
  const q = state.inquiry;

  return (
    <>
      <form action={action} className="flex flex-col gap-3 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <label htmlFor="code" className={labelCls}>
          문의번호
        </label>
        <input
          id="code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={8}
          required
          autoCapitalize="characters"
          placeholder="영문·숫자 8자리"
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
        {state.error && <p className="m-0 text-center text-[14px] text-[#C92A2A]">{state.error}</p>}
        <button type="submit" disabled={pending} className="h-[52px] rounded-[26px] bg-brand font-title text-[17px] text-white disabled:opacity-60">
          {pending ? "찾는 중…" : "답변 확인하기"}
        </button>
      </form>

      {q && (
        <section className="flex flex-col gap-3 rounded-[26px] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-[#FFE3EC] px-2 py-[3px] font-title text-[13px] text-brand">{q.category}</span>
            <span className="text-[13px] text-ink-sub">
              {q.code} · {date(q.createdAt)}
            </span>
          </div>
          <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.7] text-ink">{q.content}</p>
          <div className="h-px bg-[#F8D4E1]" />
          {q.answer ? (
            <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#FFF8FA] p-3.5">
              <b className="font-title text-[15px] font-normal text-brand">콩닥 답변 · {date(q.answeredAt!)}</b>
              <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.7] text-[#5E3F4C]">{q.answer}</p>
            </div>
          ) : (
            <p className="m-0 text-center text-[14px] text-ink-sub">아직 답변을 준비하고 있어요. 조금만 기다려 주세요.</p>
          )}
        </section>
      )}

      <Link href="/inquiry" className="text-center text-[14px] text-brand no-underline">
        새로 문의하기 ›
      </Link>
    </>
  );
}
