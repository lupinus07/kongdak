"use server";

import { updateTag } from "next/cache";
import { loadPaidOrder } from "@/lib/orders-server";
import type { Product } from "@/lib/products";
import { COMMENT_MAX, NICKNAME_MAX } from "@/lib/review-limits";
import { REVIEWS_TAG } from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReviewState = { ok?: boolean; error?: string };

/**
 * 결과 화면 맨 아래 후기 입력. 결과 링크(?t=)로 결제 완료 주문을 확인하고,
 * 풀이를 실제로 받은 주문만 받는다. 주문 하나에 후기 하나.
 */
export async function submitReview(token: string, product: Product, formData: FormData): Promise<ReviewState> {
  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "하트를 골라 주세요." };
  const comment = String(formData.get("comment") ?? "").trim().slice(0, COMMENT_MAX) || null;
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, NICKNAME_MAX) || null;

  const order = await loadPaidOrder(token, product);
  if (!order) return { error: "결제한 풀이를 찾지 못했어요." };

  const admin = createAdminClient();
  const { data: reading } = await admin.from("readings").select("result").eq("order_id", order.id).maybeSingle();
  if (!reading?.result) return { error: "풀이를 받은 뒤에 후기를 남길 수 있어요." };

  const { error } = await admin
    .from("reviews")
    .insert({ order_id: order.id, product_code: product, rating, comment, nickname });
  if (error) {
    if (error.code === "23505") return { ok: true }; // 이미 남긴 후기
    console.error("후기 저장 실패", error.message);
    return { error: "후기를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
  }
  updateTag(REVIEWS_TAG);
  return { ok: true };
}
