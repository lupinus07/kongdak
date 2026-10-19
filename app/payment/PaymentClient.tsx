"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { BackHeader } from "@/components/BackHeader";
import { BenefitBox } from "@/components/form";
import { loadOrderDraft, type OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";

function summaryOf(d: OrderDraft) {
  if (d.product === "compat") {
    return `${d.relation} · ${d.me.birth || "-"} ♥ ${d.you.birth || "-"}`;
  }
  return `${d.situation} · ${d.birth || "-"} (${d.calendar})`;
}

const PAY_LABEL = { compat: "990원 결제하고 궁합 보기", love: "990원 결제하고 연애운 보기" } as const;

export function PaymentClient() {
  // undefined: 아직 읽는 중, null: 보관된 입력 없음
  const [draft, setDraft] = useState<OrderDraft | null | undefined>(undefined);
  const [agreed, setAgreed] = useState(true);
  const [paying, setPaying] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 뒤에 불러온다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft());
  }, []);

  const product = draft ? PRODUCTS[draft.product] : null;
  const productCode = draft?.product;

  // 결제위젯은 화면에 보이는 금액(표시용)으로 그리고, 실제 결제 금액은 주문 생성 때 서버 값으로 다시 정한다.
  useEffect(() => {
    if (!productCode) return;
    let cancelled = false;
    (async () => {
      const { data } = await createClient().auth.getUser();
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!data.user || !clientKey || cancelled) return;
      const toss = await loadTossPayments(clientKey);
      const widgets = toss.widgets({ customerKey: data.user.id });
      await widgets.setAmount({ currency: "KRW", value: PRODUCTS[productCode].price });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      if (!cancelled) widgetsRef.current = widgets;
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productCode]);

  async function onPay() {
    const widgets = widgetsRef.current;
    if (!draft || !widgets || paying) return;
    setPaying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: draft }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const order = (await res.json()) as { orderId: string; orderName: string; amount: number };
      await widgets.setAmount({ currency: "KRW", value: order.amount });
      await widgets.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (e) {
      // 결제창을 직접 닫은 경우도 여기로 온다
      alert(e instanceof Error && e.message ? e.message : "결제를 시작하지 못했어요. 다시 시도해 주세요.");
      setPaying(false);
    }
  }

  return (
    <>
      <BackHeader title="결제하기" href={draft ? `/${draft.product}` : "/"} />

      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-3 pt-2">
        {draft === null && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="m-0 text-ink-sub">
              입력한 정보를 찾지 못했어요.
              <br />
              먼저 보고 싶은 풀이를 골라 입력해 주세요.
            </p>
            <div className="flex gap-2.5">
              <Link href="/compat" className="rounded-[28px] bg-brand px-5 py-3 font-title text-white no-underline">
                둘의 궁합
              </Link>
              <Link href="/love" className="rounded-[28px] bg-brand px-5 py-3 font-title text-white no-underline">
                나의 연애운
              </Link>
            </div>
          </div>
        )}

        {draft && product && (
          <>
            <section className="flex flex-col gap-3 rounded-[26px] bg-white p-[18px] shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFE3EC]">
                  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-title text-lg">{product.name}</span>
                  <span className="text-[13px] text-ink-sub">{summaryOf(draft)}</span>
                </div>
              </div>

              <BenefitBox items={product.benefits} title="이런 내용을 볼 수 있어요" />

              <Link href={product.sampleHref} className="self-start py-1 text-[13px] text-brand">
                {product.sampleLabel}
              </Link>
            </section>

            <section className="flex flex-col gap-3 rounded-[26px] bg-white p-[18px]">
              <span className="font-title text-base">결제 수단</span>
              <div id="payment-method" />
              <div id="agreement" />
            </section>

            <div className="flex items-baseline justify-between px-1">
              <span className="text-[15px]">최종 결제 금액</span>
              <span className="font-title text-[26px] text-brand">{product.price.toLocaleString()}원</span>
            </div>
          </>
        )}
      </main>

      {draft && product && (
        <footer className="sticky bottom-0 z-10 flex flex-col gap-2.5 rounded-t-[28px] bg-white px-[22px] pb-[22px] pt-4 shadow-[0_-8px_22px_rgba(194,37,92,0.10)]">
          <label className="flex items-center gap-2 text-[13px] text-[#6B4A58]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="m-0 size-5 accent-brand"
            />
            주문 내용을 확인했으며 결제에 동의해요
          </label>
          <button
            type="button"
            disabled={!agreed || paying}
            onClick={onPay}
            className="flex h-[58px] items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)] disabled:bg-[#E3AFC2] disabled:shadow-none"
          >
            {PAY_LABEL[draft.product]}
          </button>
        </footer>
      )}
    </>
  );
}
