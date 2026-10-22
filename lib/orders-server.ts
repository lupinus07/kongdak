import type { Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** 결과 링크(?t=)의 비밀 값 형식: 64자리 16진수 (DB 기본값) */
export function isAccessToken(t: string | undefined): t is string {
  return !!t && /^[0-9a-f]{64}$/.test(t);
}

export type PaidOrder = { id: string; product: Product; input: Record<string, unknown>; orderCode: string };

/**
 * 결과 링크의 비밀 값으로 결제 완료된 주문을 찾는다. 회원·비회원 모두 링크로 결과를 연다.
 * 비밀 값은 추측할 수 없고(256비트) 주문마다 달라서, 링크를 가진 사람만 그 결과를 볼 수 있다.
 */
export async function loadPaidOrder(token: string | undefined, product: Product): Promise<PaidOrder | null> {
  if (!isAccessToken(token)) return null;
  const { data } = await createAdminClient()
    .from("orders")
    .select("id, product_code, status, input, order_code")
    .eq("access_token", token)
    .maybeSingle();
  if (!data || data.status !== "DONE" || data.product_code !== product) return null;
  return { id: data.id, product, input: data.input, orderCode: data.order_code };
}
