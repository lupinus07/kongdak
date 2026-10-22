import { NextResponse } from "next/server";
import { completePayment } from "@/lib/payment-complete";
import { PRODUCTS } from "@/lib/products";

/**
 * 포트원 결제창에서 돌아오는 곳(모바일은 redirectUrl, PC는 결제 화면이 직접 이동).
 * 실패·취소면 code·message가 붙어 온다. 성공이면 서버에서 결제를 확인한 뒤 결과 링크로 보낸다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (message: string) =>
    NextResponse.redirect(`${origin}/payment/fail?message=${encodeURIComponent(message)}`);

  const paymentId = searchParams.get("paymentId");
  if (searchParams.get("code")) return fail(searchParams.get("message") || "결제가 취소됐어요.");
  if (!paymentId) return fail("결제 정보가 올바르지 않아요.");

  const result = await completePayment(paymentId);
  if (!result.ok) return fail(result.message);
  return NextResponse.redirect(`${origin}${PRODUCTS[result.product].resultHref}?t=${result.token}`);
}
