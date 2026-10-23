import type { Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 토스페이먼츠 결제 승인 처리. 결제창에서 돌아올 때(/payment/success)만 부른다.
 * 클라이언트가 보낸 금액은 믿지 않고, 주문(READY)에 저장된 products 가격과 맞는지 대조한 뒤 승인(confirm)한다.
 */

export type CompleteResult = { ok: true; token: string; product: Product } | { ok: false; message: string };

type TossPayment = {
  paymentKey: string;
  totalAmount: number;
  method?: string; // "카드", "간편결제" 등
  easyPay?: { provider?: string } | null; // "토스페이", "카카오페이", "네이버페이" 등
  approvedAt?: string;
  message?: string;
};

function methodLabel(payment: TossPayment) {
  if (payment.method === "간편결제") return `EASY_PAY:${payment.easyPay?.provider ?? "UNKNOWN"}`;
  if (payment.method === "카드") return "CARD";
  return payment.method ?? null;
}

export async function completePayment(paymentKey: string, orderId: string, amount: number): Promise<CompleteResult> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, product_code, amount, status, access_token")
    .eq("payment_id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, message: "주문을 찾지 못했어요." };
  const done = { ok: true, token: order.access_token as string, product: order.product_code as Product } as const;
  if (order.status === "DONE") return done; // 새로고침 등 중복 호출
  if (order.status !== "READY") return { ok: false, message: "처리할 수 없는 주문이에요." };
  if (order.amount !== amount) return { ok: false, message: "결제 금액이 주문과 달라요." };

  let res: Response;
  try {
    res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": orderId,
      },
      body: JSON.stringify({ paymentKey, orderId, amount: order.amount }),
    });
  } catch {
    // 네트워크 오류는 승인 여부를 알 수 없으니 주문을 실패로 닫지 않는다
    return { ok: false, message: "결제 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  const payment = (await res.json().catch(() => ({}))) as TossPayment;

  if (!res.ok || payment.totalAmount !== order.amount) {
    await admin.from("orders").update({ status: "FAILED" }).eq("id", order.id).eq("status", "READY");
    return { ok: false, message: payment.message ?? "결제를 승인하지 못했어요." };
  }

  await admin
    .from("orders")
    .update({
      status: "DONE",
      pg_tx_id: payment.paymentKey,
      pg_provider: "tosspayments",
      method: methodLabel(payment),
      approved_at: payment.approvedAt,
    })
    .eq("id", order.id)
    .eq("status", "READY");

  // 풀이는 처음 열 때 생성한다(환불 시 API 비용 절약). 여기서는 빈 열람 기록만 만든다.
  await admin
    .from("readings")
    .upsert(
      { order_id: order.id, user_id: order.user_id, product_code: order.product_code },
      { onConflict: "order_id", ignoreDuplicates: true },
    );

  return done;
}
