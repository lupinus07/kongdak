import { NextResponse } from "next/server";
import { Webhook } from "@portone/server-sdk";
import { completePayment } from "@/lib/payment-complete";

/**
 * 포트원 웹훅. 결제창에서 돌아오지 못해도(창을 닫음, 네트워크 끊김) 결제가 기록되게 한다.
 * 포트원 콘솔의 웹훅 주소: {사이트}/api/portone/webhook, 시크릿은 PORTONE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const body = await request.text();
  let webhook;
  try {
    webhook = await Webhook.verify(process.env.PORTONE_WEBHOOK_SECRET!, body, Object.fromEntries(request.headers));
  } catch {
    return NextResponse.json({ error: "웹훅 서명이 올바르지 않아요." }, { status: 400 });
  }
  if (webhook.type === "Transaction.Paid") {
    const result = await completePayment(webhook.data.paymentId);
    // 포트원은 2xx가 아니면 다시 보낸다. 일시 오류(조회 실패)만 재시도되도록 500을 돌려준다.
    if (!result.ok && result.message.includes("잠시 후")) return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
