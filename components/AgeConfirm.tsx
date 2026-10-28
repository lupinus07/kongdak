"use client";

import { MIN_AGE } from "@/lib/birth";

/** 카카오 로그인(회원가입) 전에 받는 만 14세 이상 확인. 체크하지 않고 누르면 needed로 안내를 띄운다. */
export function AgeConfirm({ checked, onChange, needed }: { checked: boolean; onChange: (v: boolean) => void; needed?: boolean }) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="flex items-center gap-2 text-[14px] text-[#6B4A58]">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="m-0 size-5 shrink-0 accent-brand" />
        <span>
          만 {MIN_AGE}세 이상이에요 <span className="text-ink-sub">(필수)</span>
        </span>
      </label>
      {needed && !checked && (
        <p className="m-0 pl-7 text-[13px] text-[#C92A2A]">만 {MIN_AGE}세 이상만 가입할 수 있어요. 확인에 체크해 주세요.</p>
      )}
    </div>
  );
}
