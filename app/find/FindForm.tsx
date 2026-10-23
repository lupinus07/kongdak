"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { inputCls, labelCls } from "@/components/form";

export function FindForm() {
  const router = useRouter();
  const [orderCode, setOrderCode] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = /^[0-9A-F]{8}$/.test(orderCode) && /^\d{4}$/.test(phoneLast4);

  async function find() {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode, phoneLast4 }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.path) {
      router.push(data.path);
      return;
    }
    setError(data.error ?? "잠시 후 다시 시도해 주세요.");
    setBusy(false);
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <label htmlFor="order-code" className={labelCls}>
          주문번호 (8자리)
        </label>
        <input
          id="order-code"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 8))}
          autoComplete="off"
          placeholder="예) 1A2B3C4D"
          className={`${inputCls} tracking-[2px]`}
        />
        <label htmlFor="find-phone4" className={labelCls}>
          휴대폰 번호 뒷자리 4자리
        </label>
        <input
          id="find-phone4"
          value={phoneLast4}
          onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="결제할 때 입력한 번호"
          className={inputCls}
        />
        {error && <p className="m-0 text-[14px] text-brand">{error}</p>}
      </div>
      <p className="m-0 px-1 text-xs leading-relaxed text-ink-mute">
        주문번호는 결과 화면 위쪽에 있어요. 주문번호도 모른다면 고객센터로 결제일과 결제수단을 알려 주세요.
      </p>
      <button
        type="button"
        disabled={!ready || busy}
        onClick={find}
        className="mt-auto flex h-[58px] items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)] disabled:bg-[#E3AFC2] disabled:shadow-none"
      >
        {busy ? "찾는 중…" : "내 풀이 찾기"}
      </button>
    </>
  );
}
