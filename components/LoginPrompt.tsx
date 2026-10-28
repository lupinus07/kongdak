"use client";

import { useState } from "react";
import { AgeConfirm } from "@/components/AgeConfirm";
import { loginWithKakao } from "@/lib/session";

/** 비로그인 상태에서 보여주는 로그인 안내 카드 (메뉴, 마이페이지 공용) */
export function LoginPrompt({
  onDone,
  title = "로그인하고 내 기록 보기",
  desc = (
    <>
      결제 내역과 지난 풀이를
      <br />
      언제든 다시 볼 수 있어요
    </>
  ),
}: {
  onDone?: () => void;
  title?: string;
  desc?: React.ReactNode;
}) {
  const [adult, setAdult] = useState(false);
  const [askedAge, setAskedAge] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg px-5 py-6 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
      </svg>
      <div className="flex flex-col gap-1">
        <p className="m-0 font-title text-xl">{title}</p>
        <p className="m-0 text-[14px] leading-normal text-ink-sub">{desc}</p>
      </div>
      <AgeConfirm checked={adult} onChange={setAdult} needed={askedAge} />
      <button
        type="button"
        onClick={() => {
          // 만 14세 미만은 회원가입을 받지 않는다
          if (!adult) return setAskedAge(true);
          onDone?.();
          loginWithKakao(window.location.pathname + window.location.search);
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
