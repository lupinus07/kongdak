"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ANONYMOUS, loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { BackHeader } from "@/components/BackHeader";
import { BusinessFooter } from "@/components/BusinessFooter";
import { BenefitBox } from "@/components/form";
import { draftSummary, loadOrderDraft, saveOrderDraft, type OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { MIN_AGE } from "@/lib/birth";
import { loginWithKakao, useSession } from "@/lib/session";

export function PaymentClient() {
  // undefined: 아직 읽는 중, null: 보관된 입력 없음
  const [draft, setDraft] = useState<OrderDraft | null | undefined>(undefined);
  const { session, ready } = useSession();
  const [phoneLast4, setPhoneLast4] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 뒤에 불러온다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft());
  }, []);

  const product = draft ? PRODUCTS[draft.product] : null;
  const productCode = draft?.product;
  const guest = ready && !session;
  const phoneOk = /^\d{4}$/.test(phoneLast4);
  const canPay = ready && widgetReady && agreed && (!guest || phoneOk) && !paying;

  // 결제위젯은 화면에 보이는 금액(표시용)으로 그리고, 실제 결제 금액은 주문 생성 때 서버 값으로 다시 정한다.
  useEffect(() => {
    if (!productCode || !ready) return;
    let cancelled = false;
    (async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) return;
      const { data } = await createClient().auth.getUser();
      const toss = await loadTossPayments(clientKey);
      const widgets = toss.widgets({ customerKey: data.user?.id ?? ANONYMOUS });
      await widgets.setAmount({ currency: "KRW", value: PRODUCTS[productCode].price });
      await widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" });
      if (cancelled) return;
      widgetsRef.current = widgets;
      setWidgetReady(true);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productCode, ready]);

  async function onPay() {
    const widgets = widgetsRef.current;
    if (!draft || !widgets || !canPay) return;
    setPaying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: draft, phoneLast4: guest ? phoneLast4 : undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const order = (await res.json()) as { orderId: string; orderName: string; amount: number };
      await widgets.setAmount({ currency: "KRW", value: order.amount }); // 서버가 products 가격으로 정한 금액
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

  function loginFirst() {
    // 만 14세 미만은 회원가입을 받지 않는다
    if (!confirm(`만 ${MIN_AGE}세 이상인가요? 만 ${MIN_AGE}세 미만은 가입할 수 없어요.`)) return;
    if (draft) saveOrderDraft(draft);
    loginWithKakao("/payment");
  }

  return (
    <>
      <BackHeader title="결제하기" href={draft ? `/${draft.product}` : "/"} />

      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-8 pt-2">
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
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-title text-lg">{product.name}</span>
                  <span className="truncate text-[14px] text-ink-sub">{draftSummary(draft)}</span>
                </div>
                <span className="font-title text-[22px] text-brand">{product.price.toLocaleString()}원</span>
              </div>
              <BenefitBox items={product.benefits} title="이런 내용을 볼 수 있어요" />
            </section>

            <section className="flex flex-col gap-2.5 rounded-[26px] bg-white p-[18px]">
              <span className="font-title text-base">결제 수단</span>
              <div id="payment-method" className="-mx-2" />
              {guest && (
                <div className="flex flex-col gap-2 rounded-[20px] bg-[#FFF0F5] p-3.5">
                  <label htmlFor="phone4" className="font-title text-base text-brand">
                    휴대폰 번호 뒷자리 4자리
                  </label>
                  <input
                    id="phone4"
                    value={phoneLast4}
                    onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="예) 1234"
                    className="h-[50px] w-full min-w-0 rounded-[14px] border-2 border-[#4A2B38] bg-white px-3.5 text-[16px] text-ink outline-none placeholder:text-[#9A7C8A] focus:border-brand focus:ring-2 focus:ring-[#FF6B9A]/40"
                  />
                  <p className="m-0 text-xs leading-relaxed text-ink-sub">
                    로그인 없이 결제할 수 있어요. 결과 링크를 잃어버렸을 때 주문번호와 함께 다시 찾는 데 써요.
                  </p>
                  <button type="button" onClick={loginFirst} className="self-start p-0 text-[14px] text-brand underline">
                    카카오 로그인하고 내 기록에 저장하기
                  </button>
                </div>
              )}
              <label className="mt-1 flex items-start gap-2 text-[14px] leading-snug text-[#6B4A58]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="m-0 mt-px size-5 shrink-0 accent-brand"
                />
                <span>
                  만 {MIN_AGE}세 이상이고, 주문 내용을 확인했고 결제에 동의해요. 풀이를 연 뒤에는 서비스 오류가 아니면 환불이 어려워요.
                </span>
              </label>
              <p className="m-0 pl-7 text-xs leading-relaxed text-ink-mute">
                결제하면{" "}
                <Link href="/terms" className="text-ink-sub">
                  이용약관
                </Link>
                과{" "}
                <Link href="/privacy" className="text-ink-sub">
                  개인정보처리방침
                </Link>
                (풀이 작성을 위한 국외 이전 포함)에 동의하게 돼요.
              </p>
              {!canPay && !paying && ready && (
                <p className="m-0 text-xs text-brand">
                  {guest && !phoneOk ? "휴대폰 번호 뒷자리 4자리를 입력해 주세요" : !agreed ? "결제 동의에 체크해 주세요" : ""}
                </p>
              )}
              <button
                type="button"
                disabled={!canPay}
                onClick={onPay}
                className="mt-1 h-14 rounded-[28px] bg-brand font-title text-[18px] text-white disabled:opacity-45"
              >
                {paying ? "결제창을 여는 중…" : `${product.price.toLocaleString()}원 결제하기`}
              </button>
            </section>
          </>
        )}
      </main>
      <BusinessFooter />
    </>
  );
}
