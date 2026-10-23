import { cacheLife, cacheTag } from "next/cache";
import type { Product } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** 이용 후기. 결과 링크로 결제를 확인한 주문만 쓸 수 있고(구매 인증), 읽기·쓰기 모두 서버에서만 한다. */

export const REVIEWS_TAG = "reviews";

export type PublicReview = { id: string; product: Product; rating: number; comment: string; name: string; date: string };
export type ReviewSummary = { count: number; average: number; items: PublicReview[] };

/** 닉네임은 첫 글자만 보여주고 나머지는 가린다(실명을 적어도 그대로 드러나지 않게). 비우면 익명. */
export function maskNickname(nickname: string | null): string {
  const chars = [...(nickname ?? "").trim()];
  if (!chars.length) return "익명";
  return chars[0] + "*".repeat(Math.max(chars.length - 1, 1));
}

/** 메인 화면 후기 띠: 별점 평균과 최근 한 줄 후기. 몇 분 동안 캐시해서 방문마다 DB를 부르지 않는다. */
export async function loadReviewSummary(): Promise<ReviewSummary> {
  "use cache";
  cacheLife("minutes");
  cacheTag(REVIEWS_TAG);
  try {
    const { data, error } = await createAdminClient()
      .from("reviews")
      .select("id, product_code, rating, comment, nickname, created_at")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error || !data?.length) return { count: 0, average: 0, items: [] };
    const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    const items = data
      .filter((r) => r.comment)
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        product: r.product_code as Product,
        rating: r.rating,
        comment: r.comment!,
        name: maskNickname(r.nickname),
        date: r.created_at.slice(0, 10).replaceAll("-", "."),
      }));
    return { count: data.length, average, items };
  } catch {
    // 후기를 못 불러와도 메인 화면은 떠야 한다
    return { count: 0, average: 0, items: [] };
  }
}

/** 이 주문에 이미 쓴 후기 (결과 화면에서 입력란 대신 보여준다) */
export async function loadOrderReview(orderId: string): Promise<{ rating: number; comment: string | null } | null> {
  const { data } = await createAdminClient().from("reviews").select("rating, comment").eq("order_id", orderId).maybeSingle();
  return data;
}
