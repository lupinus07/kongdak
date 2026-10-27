import type { InquiryDetail } from "@/lib/inquiry-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** 문의 게시판 읽기 (서버 전용). 목록에는 내용·주문번호·연락처를 싣지 않는다. */

export const PAGE_SIZE = 15;

export type InquiryListItem = { code: string; category: string; createdAt: string; answered: boolean; mine: boolean };

/** 지금 로그인한 사용자 id (없으면 null) */
export async function currentUserId(): Promise<string | null> {
  const { data } = await (await createClient()).auth.getUser();
  return data.user?.id ?? null;
}

export async function listInquiries({ page, mineOnly, userId }: { page: number; mineOnly: boolean; userId: string | null }) {
  let q = createAdminClient().from("inquiries").select("code, category, created_at, answered_at, user_id");
  if (mineOnly) {
    if (!userId) return { items: [] as InquiryListItem[], hasNext: false };
    q = q.eq("user_id", userId);
  }
  const from = (page - 1) * PAGE_SIZE;
  // 한 개 더 읽어서 다음 쪽이 있는지 본다
  const { data } = await q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE);
  const rows = data ?? [];
  return {
    items: rows.slice(0, PAGE_SIZE).map(
      (r): InquiryListItem => ({
        code: r.code,
        category: r.category,
        createdAt: r.created_at,
        answered: !!r.answered_at,
        mine: !!userId && r.user_id === userId,
      }),
    ),
    hasNext: rows.length > PAGE_SIZE,
  };
}

const DETAIL = "code, category, content, created_at, answer, answered_at";

export function toDetail(r: {
  code: string;
  category: string;
  content: string;
  created_at: string;
  answer: string | null;
  answered_at: string | null;
}): InquiryDetail {
  return { code: r.code, category: r.category, content: r.content, createdAt: r.created_at, answer: r.answer, answeredAt: r.answered_at };
}

/** 로그인한 본인의 문의면 비밀번호 없이 연다 */
export async function loadOwnInquiry(code: string, userId: string | null): Promise<InquiryDetail | null> {
  if (!userId) return null;
  const { data } = await createAdminClient().from("inquiries").select(DETAIL).eq("code", code).eq("user_id", userId).maybeSingle();
  return data ? toDetail(data) : null;
}

/** 이 문의번호가 있는지 (상세 화면의 '없는 문의' 안내용) */
export async function inquiryExists(code: string): Promise<{ category: string; createdAt: string } | null> {
  const { data } = await createAdminClient().from("inquiries").select("category, created_at").eq("code", code).maybeSingle();
  return data ? { category: data.category, createdAt: data.created_at } : null;
}
