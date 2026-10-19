"use client";

import { devLogin } from "@/lib/session";

/** 비로그인 상태에서 보여주는 로그인 안내 카드 (메뉴, 마이페이지 공용) */
export function LoginPrompt({ onDone }: { onDone?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg px-5 py-6 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
      </svg>
      <div className="flex flex-col gap-1">
        <p className="m-0 font-title text-xl">로그인하고 내 기록 보기</p>
        <p className="m-0 text-[13px] leading-normal text-ink-sub">
          결제 내역과 지난 풀이를
          <br />
          언제든 다시 볼 수 있어요
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          // TODO: Supabase Auth 카카오 로그인으로 교체
          devLogin();
          onDone?.();
        }}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#FEE500] text-[17px] font-bold text-black/85"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4C6.8 4 3 7.2 3 11.1c0 2.5 1.6 4.7 4.1 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.3 0 .7.1 1 .1 5.2 0 9-3.2 9-7.2S17.2 4 12 4z" fill="#000000" />
        </svg>
        카카오로 시작하기
      </button>
    </div>
  );
}
