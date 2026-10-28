import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { draftAgeError, isDraftReady, WORRY_MAX, type OrderDraft } from "@/lib/order-draft";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * 결제 직전에 주문(READY)을 만든다. 금액은 클라이언트 값이 아니라 products 테이블 가격을 쓴다.
 * 로그인하지 않았으면 비회원 주문으로 만들고, 휴대폰 뒷자리 4자리를 받아 둔다(링크 다시 찾기·환불 확인용).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const body = (await request.json().catch(() => null)) as { input?: OrderDraft; phoneLast4?: string } | null;
  const code = body?.input?.product;
  if (code !== "compat" && code !== "love") {
    return NextResponse.json({ error: "입력 정보가 올바르지 않아요." }, { status: 400 });
  }
  if (!isDraftReady(body!.input!)) {
    return NextResponse.json({ error: "생년월일을 정확히 입력해 주세요." }, { status: 400 });
  }
  // 만 14세 미만 생년월일은 주문을 만들지 않는다 (화면에서 막아도 저장소를 고쳐 보낼 수 있어서 서버에서 다시 본다)
  const ageError = draftAgeError(body!.input!);
  if (ageError) return NextResponse.json({ error: ageError }, { status: 400 });
  const input = body!.input!;
  // 고민은 직접 적는 글이라 길이를 서버에서 한 번 더 자른다
  if (input.product === "love") {
    const worry = typeof input.worry === "string" ? input.worry.trim().slice(0, WORRY_MAX) : "";
    if (worry) input.worry = worry;
    else delete input.worry;
  }
  const phoneLast4 = body?.phoneLast4 ?? "";
  if (!auth.user && !/^\d{4}$/.test(phoneLast4)) {
    return NextResponse.json({ error: "휴대폰 번호 뒷자리 4자리를 입력해 주세요." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("code, name, price")
    .eq("code", code)
    .eq("is_active", true)
    .single();
  if (!product) return NextResponse.json({ error: "판매하지 않는 상품이에요." }, { status: 404 });

  const paymentId = `kd_${randomUUID().replaceAll("-", "")}`;
  const { error } = await admin.from("orders").insert({
    user_id: auth.user?.id ?? null,
    phone_last4: auth.user ? null : phoneLast4,
    product_code: product.code,
    payment_id: paymentId,
    amount: product.price,
    input,
  });
  if (error) return NextResponse.json({ error: "주문을 만들지 못했어요." }, { status: 500 });

  return NextResponse.json({ orderId: paymentId, orderName: product.name, amount: product.price });
}
