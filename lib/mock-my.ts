import type { Product } from "./products";

/**
 * 마이페이지 화면 확인용 샘플 데이터.
 * TODO: orders / readings 테이블 조회(서버, 본인 것만)로 교체한다.
 */

export type MockOrder = {
  id: string;
  product: Product;
  paidAt: string; // YYYY-MM-DD
  amount: number;
  opened: boolean;
};

export type MockReading = {
  id: string;
  product: Product;
  summary: string;
  at: string; // YYYY.MM.DD
  opened: boolean;
};

export const MOCK_ORDERS: MockOrder[] = [
  { id: "o3", product: "love", paidAt: "2026-10-16", amount: 990, opened: false },
  { id: "o2", product: "compat", paidAt: "2026-10-12", amount: 990, opened: true },
  { id: "o1", product: "love", paidAt: "2026-10-03", amount: 990, opened: true },
];

export const MOCK_READINGS: MockReading[] = [
  { id: "o3", product: "love", summary: "썸 · 2001.05.20 (양력)", at: "2026.10.16", opened: false },
  { id: "o2", product: "compat", summary: "썸 타는 중 · 2001.05.20 ♥ 2000.11.03", at: "2026.10.12", opened: true },
  { id: "o1", product: "love", summary: "솔로 · 2001.05.20 (양력)", at: "2026.10.03", opened: true },
];

/** 풀이를 열기 전, 결제일로부터 7일 이내면 환불할 수 있다. */
export function refundDeadline(paidAt: string, opened: boolean, now = new Date()): string | null {
  if (opened) return null;
  const end = new Date(paidAt);
  end.setDate(end.getDate() + 7);
  if (end.getTime() < now.getTime()) return null;
  return `${end.getMonth() + 1}.${end.getDate()}`;
}
