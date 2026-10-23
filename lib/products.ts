export type Product = "compat" | "love";

/** 화면 표시용 상품 정보. 결제 금액 검증은 서버에서 products 테이블 가격으로 한다. */
export const PRODUCTS: Record<
  Product,
  { name: string; benefits: string[]; price: number; sampleHref: string; sampleLabel: string; resultHref: string }
> = {
  compat: {
    name: "우리 궁합 풀이",
    benefits: ["콩닥지수 (궁합 점수)", "잘 맞는 점", "조심할 점", "더 가까워지는 팁"],
    price: 1980,
    sampleHref: "/compat/sample",
    sampleLabel: "샘플 궁합 먼저 보기 ›",
    resultHref: "/compat/result",
  },
  love: {
    name: "나의 연애운 풀이",
    benefits: ["나의 연애 스타일", "상황별 맞춤 풀이", "잘 맞는 사람", "조심할 점", "1년 월별 흐름"],
    price: 990,
    sampleHref: "/love/sample",
    sampleLabel: "샘플 풀이 먼저 보기 ›",
    resultHref: "/love/result",
  },
};
