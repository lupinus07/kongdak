import { NextResponse } from "next/server";
import { completePayment } from "@/lib/payment-complete";
import { PRODUCTS } from "@/lib/products";

/** 토스 결제창에서 돌아오는 곳(successUrl). 서버에서 주문 금액을 대조한 뒤 결제를 승인하고 결과 링크로 보낸다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (message: string) =>
    NextResponse.redirect(`${origin}/payment/fail?message=${encodeURIComponent(message)}`);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = Number(searchParams.get("amount"));
  if (!paymentKey || !orderId || !Number.isFinite(amount)) return fail("결제 정보가 올바르지 않아요.");

  const result = await completePayment(paymentKey, orderId, amount);
  if (!result.ok) return fail(result.message);
  return NextResponse.redirect(`${origin}${PRODUCTS[result.product].resultHref}?t=${result.token}`);
}
