"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getKakao, loadKakao } from "@/lib/kakao-share";
import { saveMyReading } from "@/lib/my-readings";
import { PRODUCTS, type Product } from "@/lib/products";

/**
 * 결제한 풀이의 결과 링크 안내. 비회원은 이 링크로만 결과를 다시 열 수 있어서
 * 내 카톡으로 보내기·링크 복사를 권하고, 이 브라우저에도 기억해 둔다.
 */
export function ResultLinkBox({
  product,
  orderCode,
  waiting,
}: {
  product: Product;
  orderCode?: string;
  /** 풀이를 만드는 중에 보여주는 모드: 나가도 이 링크로 다시 볼 수 있다고 안내한다 */
  waiting?: boolean;
}) {
  const token = useSearchParams().get("t");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    saveMyReading({ token, product, orderCode });
    loadKakao(); // 버튼을 누르면 바로 보낼 수 있게 미리 불러 둔다
  }, [token, product, orderCode]);

  if (!token) return null;
  const url = () => `${location.origin}${PRODUCTS[product].resultHref}?t=${token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
    } catch {
      prompt("이 링크를 복사해서 보관해 주세요", url());
    }
  }

  async function sendToMe() {
    const kakao = getKakao();
    const name = PRODUCTS[product].name;
    if (kakao) {
      const link = { mobileWebUrl: url(), webUrl: url() };
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `콩닥 ${name}`,
          description: `${orderCode ? `주문번호 ${orderCode} · ` : ""}이 링크로 언제든 다시 볼 수 있어요`,
          imageUrl: `${location.origin}/opengraph-image`,
          imageWidth: 1200,
          imageHeight: 630,
          link,
        },
        buttons: [{ title: "내 풀이 보기", link }],
      });
      return;
    }
    // 카카오 키가 없거나 SDK를 못 불러오면 기본 공유창, 그것도 없으면 링크 복사
    if ("share" in navigator) {
      await navigator.share({ title: `콩닥 ${name}`, url: url() }).catch(() => {});
      return;
    }
    copy();
  }

  return (
    <section className="flex flex-col gap-2.5 rounded-[24px] border-2 border-dashed border-[#F3B6CB] bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <b className="font-title text-[15px] font-normal text-brand">
          {waiting ? "기다리기 어렵다면 링크를 먼저 저장해 두세요" : "이 풀이는 링크로 다시 볼 수 있어요"}
        </b>
        {orderCode && <span className="shrink-0 text-xs text-ink-sub">주문번호 {orderCode}</span>}
      </div>
      <p className="m-0 text-xs leading-relaxed text-ink-sub">
        링크를 꼭 보관해 주세요. 잃어버렸다면 주문번호와 휴대폰 뒷자리로 다시 찾을 수 있어요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={sendToMe}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#FEE500] text-sm font-bold text-black/85"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4C6.8 4 3 7.2 3 11.1c0 2.5 1.6 4.7 4.1 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.3 0 .7.1 1 .1 5.2 0 9-3.2 9-7.2S17.2 4 12 4z" fill="#000000" />
          </svg>
          내 카톡으로 보내기
        </button>
        <button
          type="button"
          onClick={copy}
          className="h-11 flex-1 rounded-[14px] border-2 border-[#F3C6D6] bg-white font-title text-sm text-brand"
        >
          {copied ? "복사했어요" : "링크 복사"}
        </button>
      </div>
    </section>
  );
}
