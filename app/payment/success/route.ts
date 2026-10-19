import { NextResponse } from "next/server";
import { PRODUCTS, type Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** 토스 결제창에서 돌아오는 곳. 서버에서 주문 금액을 대조한 뒤 결제를 승인하고 기록한다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = Number(searchParams.get("amount"));
  const fail = (message: string) =>
    NextResponse.redirect(`${origin}/payment/fail?message=${encodeURIComponent(message)}`);

  if (!paymentKey || !orderId || !Number.isFinite(amount)) return fail("결제 정보가 올바르지 않아요.");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("로그인이 필요해요.");

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, product_code, amount, status")
    .eq("toss_order_id", orderId)
    .eq("user_id", auth.user.id)
    .single();
  if (!order) return fail("주문을 찾지 못했어요.");

  const resultUrl = `${origin}${PRODUCTS[order.product_code as Product].resultHref}?order=${order.id}`;
  if (order.status === "DONE") return NextResponse.redirect(resultUrl); // 새로고침 등 중복 호출
  if (order.status !== "READY") return fail("처리할 수 없는 주문이에요.");
  if (order.amount !== amount) return fail("결제 금액이 주문과 달라요.");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": orderId,
    },
    body: JSON.stringify({ paymentKey, orderId, amount: order.amount }),
  });
  const payment = await res.json();

  if (!res.ok || payment.totalAmount !== order.amount) {
    await admin.from("orders").update({ status: "FAILED" }).eq("id", order.id).eq("status", "READY");
    return fail(payment.message ?? "결제를 승인하지 못했어요.");
  }

  await admin
    .from("orders")
    .update({
      status: "DONE",
      payment_key: payment.paymentKey,
      method: payment.method,
      approved_at: payment.approvedAt,
    })
    .eq("id", order.id);

  // 풀이는 처음 열 때 생성한다(환불 시 API 비용 절약). 여기서는 빈 열람 기록만 만든다.
  await admin
    .from("readings")
    .upsert(
      { order_id: order.id, user_id: auth.user.id, product_code: order.product_code },
      { onConflict: "order_id", ignoreDuplicates: true },
    );

  return NextResponse.redirect(resultUrl);
}
