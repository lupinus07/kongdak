import { PaymentClient } from "@portone/server-sdk";
import type { PaidPayment, Payment } from "@portone/server-sdk/payment";
import type { Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 포트원 결제 완료 처리. 결제창에서 돌아올 때(/payment/complete)와 포트원 웹훅이 둘 다 부르고, 먼저 온 쪽이 기록한다.
 * 클라이언트가 보낸 값은 믿지 않고, 포트원 서버에서 결제를 다시 조회해 PAID와 금액(주문 금액 = products 가격)을 확인한다.
 */

export type CompleteResult = { ok: true; token: string; product: Product } | { ok: false; message: string };

function methodLabel(payment: PaidPayment) {
  const m = payment.method;
  if (!m) return null;
  if (m.type === "PaymentMethodEasyPay") return `EASY_PAY:${m.provider ?? "UNKNOWN"}`;
  if (m.type === "PaymentMethodCard") return "CARD";
  return String(m.type);
}

export async function completePayment(paymentId: string): Promise<CompleteResult> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, product_code, amount, status, access_token")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (!order) return { ok: false, message: "주문을 찾지 못했어요." };
  const done = { ok: true, token: order.access_token as string, product: order.product_code as Product } as const;
  if (order.status === "DONE") return done; // 새로고침·웹훅 등 중복 호출
  if (order.status !== "READY") return { ok: false, message: "처리할 수 없는 주문이에요." };

  // PORTONE_API_URL은 테스트용 가짜 포트원 서버 주소(경로 없이 origin만). 운영에서는 비워 두면 https://api.portone.io를 쓴다.
  const portone = PaymentClient({ secret: process.env.PORTONE_API_SECRET!, baseUrl: process.env.PORTONE_API_URL || undefined });
  let payment: Payment;
  try {
    payment = await portone.getPayment({ paymentId });
  } catch {
    return { ok: false, message: "결제 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  if (payment.status !== "PAID") return { ok: false, message: "결제가 완료되지 않았어요." };

  if (payment.amount.total !== order.amount) {
    // 금액이 바뀐 결제(위·변조)는 기록하지 않고 바로 취소한다
    await portone.cancelPayment({ paymentId, reason: "결제 금액 불일치" }).catch(() => {});
    await admin.from("orders").update({ status: "FAILED" }).eq("id", order.id).eq("status", "READY");
    return { ok: false, message: "결제 금액이 주문과 달라 결제를 취소했어요." };
  }

  await admin
    .from("orders")
    .update({
      status: "DONE",
      pg_tx_id: payment.pgTxId ?? payment.transactionId,
      pg_provider: payment.channel.pgProvider,
      method: methodLabel(payment),
      approved_at: payment.paidAt,
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
