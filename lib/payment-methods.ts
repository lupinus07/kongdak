/** 결제 화면의 결제수단. 포트원 결제창을 이 결제수단으로 바로 연다. */

export type PayMethodId = "kakaopay" | "naverpay" | "tosspay" | "card";

export type PayMethod = {
  id: PayMethodId;
  label: string;
  /** 간편결제면 포트원 easyPayProvider, 카드면 없음 */
  easyPayProvider?: "KAKAOPAY" | "NAVERPAY" | "TOSSPAY";
};

export const PAY_METHODS: PayMethod[] = [
  { id: "kakaopay", label: "카카오페이", easyPayProvider: "KAKAOPAY" },
  { id: "naverpay", label: "네이버페이", easyPayProvider: "NAVERPAY" },
  { id: "tosspay", label: "토스페이", easyPayProvider: "TOSSPAY" },
  { id: "card", label: "신용·체크카드" },
];

/**
 * 결제수단별 포트원 채널 키. 기본은 NEXT_PUBLIC_PORTONE_CHANNEL_KEY 하나를 쓰고,
 * 카카오페이처럼 다른 PG 채널로 계약한 결제수단만 따로 넣는다(예: NEXT_PUBLIC_PORTONE_CHANNEL_KEY_KAKAOPAY).
 * Next가 빌드 때 값을 채워 넣도록 환경변수 이름을 그대로 적는다.
 */
export function channelKeyFor(id: PayMethodId): string | undefined {
  const own = {
    kakaopay: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_KAKAOPAY,
    naverpay: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_NAVERPAY,
    tosspay: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TOSSPAY,
    card: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD,
  }[id];
  return own || process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
}
