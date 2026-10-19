"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackHeader } from "@/components/BackHeader";
import { BenefitBox } from "@/components/form";
import { loadOrderDraft, type OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";

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

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 뒤에 불러온다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft());
  }, []);

  const product = draft ? PRODUCTS[draft.product] : null;

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
              <div className="flex h-[150px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#F3B6CB] bg-[#FFF8FA] text-center">
                <span className="text-sm text-[#A61E4D]">[토스페이먼츠 결제위젯 영역]</span>
                <span className="text-xs text-[#8C6A78]">토스페이 · 카드 · 간편결제가 여기에 표시돼요</span>
              </div>
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
          {agreed ? (
            <Link
              href={product.resultHref}
              className="flex h-[58px] items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
            >
              {PAY_LABEL[draft.product]}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-[58px] items-center justify-center rounded-[29px] bg-[#E3AFC2] font-title text-[19px] text-white"
            >
              {PAY_LABEL[draft.product]}
            </button>
          )}
        </footer>
      )}
    </>
  );
}
