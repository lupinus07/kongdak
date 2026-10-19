import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isDraftReady, type OrderDraft } from "@/lib/order-draft";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** 결제 직전에 주문(READY)을 만든다. 금액은 클라이언트 값이 아니라 products 테이블 가격을 쓴다. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { input?: OrderDraft } | null;
  const code = body?.input?.product;
  if (code !== "compat" && code !== "love") {
    return NextResponse.json({ error: "입력 정보가 올바르지 않아요." }, { status: 400 });
  }

  if (!isDraftReady(body!.input!)) {
    return NextResponse.json({ error: "생년월일을 정확히 입력해 주세요." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("code, name, price")
    .eq("code", code)
    .eq("is_active", true)
    .single();
  if (!product) return NextResponse.json({ error: "판매하지 않는 상품이에요." }, { status: 404 });

  const tossOrderId = `kd_${randomUUID()}`;
  const { error } = await admin.from("orders").insert({
    user_id: auth.user.id,
    product_code: product.code,
    toss_order_id: tossOrderId,
    amount: product.price,
    input: body!.input,
  });
  if (error) return NextResponse.json({ error: "주문을 만들지 못했어요." }, { status: 500 });

  return NextResponse.json({ orderId: tossOrderId, orderName: product.name, amount: product.price });
}
