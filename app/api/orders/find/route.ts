import { NextResponse } from "next/server";
import { PRODUCTS, type Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** 결과 링크를 잃어버린 비회원: 주문번호(8자리) + 휴대폰 뒷자리 4자리로 결과 링크를 다시 알려준다. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { orderCode?: string; phoneLast4?: string } | null;
  const orderCode = body?.orderCode?.trim().toUpperCase() ?? "";
  const phoneLast4 = body?.phoneLast4?.trim() ?? "";
  const notFound = NextResponse.json(
    { error: "주문을 찾지 못했어요. 주문번호와 휴대폰 뒷자리를 다시 확인해 주세요." },
    { status: 404 },
  );
  if (!/^[0-9A-F]{8}$/.test(orderCode) || !/^\d{4}$/.test(phoneLast4)) return notFound;

  const { data } = await createAdminClient()
    .from("orders")
    .select("product_code, access_token")
    .eq("order_code", orderCode)
    .eq("phone_last4", phoneLast4)
    .eq("status", "DONE")
    .limit(1)
    .maybeSingle();
  if (!data) return notFound; // 어느 값이 틀렸는지는 알려주지 않는다

  return NextResponse.json({ path: `${PRODUCTS[data.product_code as Product].resultHref}?t=${data.access_token}` });
}
