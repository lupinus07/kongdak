"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginSheet } from "@/components/LoginSheet";
import { isDraftReady, saveOrderDraft, type OrderDraft } from "@/lib/order-draft";
import type { Product } from "@/lib/products";
import { useSession } from "@/lib/session";

/** 990원 결제 버튼. 로그인 전이면 카카오 로그인 바텀시트가, 로그인 상태면 바로 결제 화면이 열린다. */
export function PayButton({ label, product, draft }: { label: string; product: Product; draft?: OrderDraft }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { session, ready } = useSession();

  function onClick() {
    if (draft && !isDraftReady(draft)) {
      alert("생년월일을 정확히 입력해 주세요.");
      return;
    }
    if (ready && session) {
      if (draft) saveOrderDraft(draft);
      router.push("/payment");
    } else {
      setOpen(true);
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
      >
        {label}
        <span className="rounded-xl bg-white/20 px-2.5 py-[3px] font-body text-[13px]">990원</span>
      </button>
      {open && <LoginSheet product={product} draft={draft} onClose={() => setOpen(false)} />}
    </>
  );
}
