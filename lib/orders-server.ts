import type { Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** 결과 링크(?t=)의 비밀 값 형식: 64자리 16진수 (DB 기본값) */
export function isAccessToken(t: string | undefined): t is string {
  return !!t && /^[0-9a-f]{64}$/.test(t);
}

/** 주문에 딸린 저장된 풀이와 후기. 결과 화면이 DB를 한 번만 읽도록 주문과 함께 가져온다. */
export type StoredReadingRow = { result: unknown; opened_at: string | null } | null;
export type PaidOrder = {
  id: string;
  product: Product;
  input: Record<string, unknown>;
  orderCode: string;
  reading: StoredReadingRow;
  review: { rating: number; comment: string | null } | null;
};

/** 1:1 관계로 끼워 넣은 값은 객체나 길이 1인 배열로 올 수 있다 */
const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

/**
 * 결과 링크의 비밀 값으로 결제 완료된 주문을 찾는다. 회원·비회원 모두 링크로 결과를 연다.
 * 비밀 값은 추측할 수 없고(256비트) 주문마다 달라서, 링크를 가진 사람만 그 결과를 볼 수 있다.
 */
export async function loadPaidOrder(token: string | undefined, product: Product): Promise<PaidOrder | null> {
  if (!isAccessToken(token)) return null;
  const { data } = await createAdminClient()
    .from("orders")
    .select("id, product_code, status, input, order_code, readings(result, opened_at), reviews(rating, comment)")
    .eq("access_token", token)
    .maybeSingle();
  if (!data || data.status !== "DONE" || data.product_code !== product) return null;
  return {
    id: data.id,
    product,
    input: data.input,
    orderCode: data.order_code,
    reading: one(data.readings),
    review: one(data.reviews),
  };
}
