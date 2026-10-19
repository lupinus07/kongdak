"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CoupleTitle } from "@/components/icons/Characters";
import { saveOrderDraft, type OrderDraft } from "@/lib/order-draft";
import type { Product } from "@/lib/products";

const COPY: Record<Product, { title: string; sub: string }> = {
  compat: {
    title: "3초 로그인하고\n우리 궁합 보기",
    sub: "결제한 궁합은 마이페이지에 저장돼서\n언제든 다시 볼 수 있어요",
  },
  love: {
    title: "3초 로그인하고\n내 연애운 보기",
    sub: "결제한 연애운은 마이페이지에 저장돼서\n언제든 다시 볼 수 있어요",
  },
};

export function LoginSheet({
  product,
  draft,
  onClose,
}: {
  product: Product;
  draft?: OrderDraft;
  onClose: () => void;
}) {
  const router = useRouter();
  const copy = COPY[product];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function startKakao() {
    // 카카오 로그인(회원가입) 화면으로 나갔다 돌아와도 입력이 남도록 먼저 보관한다.
    // TODO: Supabase Auth Kakao 로그인 연결 후 redirectTo를 /payment로 지정
    if (draft) saveOrderDraft(draft);
    router.push("/payment");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_0.2s_ease] bg-[rgba(60,25,40,0.48)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="absolute bottom-0 flex w-full max-w-[390px] animate-[sheet-up_0.25s_ease] flex-col items-center gap-4 rounded-t-[32px] bg-white px-6 pb-[30px] pt-3"
      >
        <div className="h-[5px] w-11 rounded-[3px] bg-[#F3C6D6]" />
        <CoupleTitle />
        <div className="flex flex-col gap-1.5 text-center">
          <h2 id="sheet-title" className="m-0 whitespace-pre-line font-title text-2xl font-normal">
            {copy.title}
          </h2>
          <p className="m-0 whitespace-pre-line text-sm leading-normal text-ink-sub">{copy.sub}</p>
        </div>
        <button
          type="button"
          onClick={startKakao}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#FEE500] text-[17px] font-bold text-black/85"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4C6.8 4 3 7.2 3 11.1c0 2.5 1.6 4.7 4.1 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.3 0 .7.1 1 .1 5.2 0 9-3.2 9-7.2S17.2 4 12 4z" fill="#000000" />
          </svg>
          카카오로 시작하기
        </button>
        <p className="m-0 text-center text-xs leading-relaxed text-[#8C6A78]">
          처음이라면 카카오 계정으로 바로 가입돼요.
          <br />
          시작하면{" "}
          <Link href="/terms" className="text-[#8C6A78]">
            이용약관
          </Link>
          과{" "}
          <Link href="/privacy" className="text-[#8C6A78]">
            개인정보처리방침
          </Link>
          에 동의하게 돼요.
        </p>
      </div>
    </div>
  );
}
