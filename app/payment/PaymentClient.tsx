"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { BackHeader } from "@/components/BackHeader";
import { BenefitBox, inputCls } from "@/components/form";
import { draftSummary, loadOrderDraft, saveOrderDraft, type OrderDraft } from "@/lib/order-draft";
import { channelKeyFor, PAY_METHODS, type PayMethod, type PayMethodId } from "@/lib/payment-methods";
import { PRODUCTS } from "@/lib/products";
import { loginWithKakao, useSession } from "@/lib/session";

/** 간편결제는 브랜드 색 큰 버튼, 카드는 그 아래 테두리 버튼 */
const LOOK: Record<PayMethodId, { cls: string; mark: ReactNode }> = {
  kakaopay: {
    cls: "bg-[#FEE500] text-black/85",
    mark: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4C6.8 4 3 7.2 3 11.1c0 2.5 1.6 4.7 4.1 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.3 0 .7.1 1 .1 5.2 0 9-3.2 9-7.2S17.2 4 12 4z" fill="#000000" />
      </svg>
    ),
  },
  naverpay: {
    cls: "bg-[#03C75A] text-white",
    mark: <span className="flex size-[22px] items-center justify-center rounded-[5px] bg-white font-body text-[14px] font-bold text-[#03C75A]">N</span>,
  },
  tosspay: {
    cls: "bg-[#0064FF] text-white",
    mark: <span className="flex size-[22px] items-center justify-center rounded-full bg-white font-body text-[13px] font-bold text-[#0064FF]">t</span>,
  },
  card: {
    cls: "border-2 border-[#F3C6D6] bg-white text-ink",
    mark: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18M7 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function PaymentClient() {
  // undefined: 아직 읽는 중, null: 보관된 입력 없음
  const [draft, setDraft] = useState<OrderDraft | null | undefined>(undefined);
  const { session, ready } = useSession();
  const [phoneLast4, setPhoneLast4] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState<PayMethodId | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 뒤에 불러온다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft());
  }, []);

  const product = draft ? PRODUCTS[draft.product] : null;
  const guest = ready && !session;
  const phoneOk = /^\d{4}$/.test(phoneLast4);
  const canPay = ready && agreed && (!guest || phoneOk) && !paying;

  async function pay(method: PayMethod) {
    if (!draft || !canPay) return;
    setPaying(method.id);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: draft, phoneLast4: guest ? phoneLast4 : undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const order = (await res.json()) as { paymentId: string; orderName: string; amount: number };

      const common = {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: channelKeyFor(method.id),
        paymentId: order.paymentId,
        orderName: order.orderName,
        totalAmount: order.amount, // 서버가 products 가격으로 정한 금액
        currency: "KRW" as const,
        // 모바일은 결제 후 이 주소로 돌아온다. PC는 아래에서 직접 이동한다.
        redirectUrl: `${location.origin}/payment/complete`,
      };
      const response = await PortOne.requestPayment(
        method.easyPayProvider
          ? { ...common, payMethod: "EASY_PAY", easyPay: { easyPayProvider: method.easyPayProvider } }
          : { ...common, payMethod: "CARD" },
      );
      if (!response) return; // 모바일: 결제 앱·페이지로 이동 중
      if (response.code) {
        // 결제창을 닫았거나 실패한 경우
        alert(response.message || "결제가 완료되지 않았어요.");
        setPaying(null);
        return;
      }
      // 결제 확인은 서버 경로(route handler)에서 하고 결과로 넘겨주므로 전체 페이지 이동을 쓴다
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 페이지가 아니라 리다이렉트하는 서버 경로
      window.location.assign(`${location.origin}/payment/complete?paymentId=${encodeURIComponent(response.paymentId)}`);
    } catch (e) {
      alert(e instanceof Error && e.message ? e.message : "결제를 시작하지 못했어요. 다시 시도해 주세요.");
      setPaying(null);
    }
  }

  function loginFirst() {
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
                  <span className="truncate text-[13px] text-ink-sub">{draftSummary(draft)}</span>
                </div>
                <span className="font-title text-[22px] text-brand">{product.price.toLocaleString()}원</span>
              </div>
              <BenefitBox items={product.benefits} title="이런 내용을 볼 수 있어요" />
            </section>

            {guest && (
              <section className="flex flex-col gap-2 rounded-[26px] bg-white p-[18px]">
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
                  className={inputCls}
                />
                <p className="m-0 text-xs leading-relaxed text-ink-sub">
                  로그인 없이 결제할 수 있어요. 결과 링크를 잃어버렸을 때 주문번호와 함께 다시 찾는 데 써요.
                </p>
                <button type="button" onClick={loginFirst} className="self-start p-0 text-[13px] text-brand underline">
                  카카오 로그인하고 내 기록에 저장하기
                </button>
              </section>
            )}

            <section className="flex flex-col gap-2.5 rounded-[26px] bg-white p-[18px]">
              <span className="font-title text-base">결제 수단</span>
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={!canPay}
                  onClick={() => pay(m)}
                  className={`flex h-14 items-center justify-center gap-2 rounded-[16px] font-title text-[17px] disabled:opacity-45 ${LOOK[m.id].cls}`}
                >
                  {LOOK[m.id].mark}
                  {paying === m.id ? "결제창을 여는 중…" : `${m.label}로 결제`}
                </button>
              ))}
              <label className="mt-1 flex items-start gap-2 text-[13px] leading-snug text-[#6B4A58]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="m-0 mt-px size-5 shrink-0 accent-brand"
                />
                <span>
                  주문 내용을 확인했고 결제에 동의해요. 풀이를 연 뒤에는 서비스 오류가 아니면 환불이 어려워요.
                </span>
              </label>
              {!canPay && !paying && ready && (
                <p className="m-0 text-xs text-brand">
                  {guest && !phoneOk ? "휴대폰 번호 뒷자리 4자리를 입력해 주세요" : !agreed ? "결제 동의에 체크해 주세요" : ""}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
