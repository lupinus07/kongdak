import { createClient } from "@/lib/supabase/client";
import { draftSummary, type OrderDraft } from "./order-draft";
import type { Product } from "./products";

/** 회원 '내 기록': 본인 주문·풀이를 읽는다. orders·readings RLS가 본인 것만 돌려준다. */

export type MyOrder = {
  id: string;
  product: Product;
  amount: number;
  status: "DONE" | "REFUNDED" | "CANCELED";
  method: string | null;
  paidAt: string; // ISO
  orderCode: string;
  token: string;
  summary: string;
  opened: boolean;
};

type Row = {
  id: string;
  product_code: Product;
  amount: number;
  status: MyOrder["status"];
  method: string | null;
  approved_at: string | null;
  created_at: string;
  order_code: string;
  access_token: string;
  input: OrderDraft;
  readings: { opened_at: string | null } | { opened_at: string | null }[] | null;
};

/** 결제가 끝난(환불·취소 포함) 본인 주문, 최근 결제 순. 실패하면 null. */
export async function fetchMyOrders(): Promise<MyOrder[] | null> {
  const { data, error } = await createClient()
    .from("orders")
    .select("id, product_code, amount, status, method, approved_at, created_at, order_code, access_token, input, readings(opened_at)")
    .in("status", ["DONE", "REFUNDED", "CANCELED"])
    .order("approved_at", { ascending: false, nullsFirst: false })
    .returns<Row[]>();
  if (error || !data) return null;
  return data.map((o) => {
    const reading = Array.isArray(o.readings) ? o.readings[0] : o.readings;
    return {
      id: o.id,
      product: o.product_code,
      amount: o.amount,
      status: o.status,
      method: o.method,
      paidAt: o.approved_at ?? o.created_at,
      orderCode: o.order_code,
      token: o.access_token,
      summary: draftSummary(o.input),
      opened: !!reading?.opened_at,
    };
  });
}

/** 저장된 결제수단 값(EASY_PAY:KAKAOPAY, CARD 등)을 화면용 이름으로 */
export function methodName(method: string | null): string {
  const easy: Record<string, string> = { KAKAOPAY: "카카오페이", NAVERPAY: "네이버페이", TOSSPAY: "토스페이" };
  if (!method) return "";
  if (method === "CARD") return "카드";
  if (method.startsWith("EASY_PAY:")) return easy[method.slice(9)] ?? "간편결제";
  return "";
}

/** 풀이를 열기 전, 결제일로부터 7일 이내면 환불할 수 있다. 환불 가능하면 마감일(M.D), 아니면 null. */
export function refundDeadline(paidAt: string, opened: boolean, now = new Date()): string | null {
  if (opened) return null;
  const end = new Date(paidAt);
  end.setDate(end.getDate() + 7);
  if (end.getTime() < now.getTime()) return null;
  return `${end.getMonth() + 1}.${end.getDate()}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
