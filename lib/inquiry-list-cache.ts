import { cacheLife, cacheTag } from "next/cache";
import { PAGE_SIZE, type InquiryListItem } from "@/lib/inquiry-shared";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 게시판 첫 쪽(전체 문의)을 미리 만들어 둔다. 화면을 여는 순간 목록이 보이게(네트워크를 기다리지 않게) 페이지에 같이 싣는다.
 * 공개해도 되는 칸(번호·종류·날짜·답변 여부)만 읽는다. 새 글·답변이 생기면 updateTag(INQUIRIES_TAG)로 바로 새로 만든다.
 */
export const INQUIRIES_TAG = "inquiries";

export async function loadFirstPage(): Promise<{ items: InquiryListItem[]; hasNext: boolean } | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(INQUIRIES_TAG);
  try {
    const { data, error } = await createAdminClient()
      .from("inquiries")
      .select("code, category, created_at, answered_at")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE + 1);
    if (error || !data) return null;
    return {
      items: data.slice(0, PAGE_SIZE).map((r) => ({
        code: r.code,
        category: r.category,
        createdAt: r.created_at,
        answered: !!r.answered_at,
        mine: false, // 누구 글인지는 브라우저에서 로그인 정보로 다시 채운다
      })),
      hasNext: data.length > PAGE_SIZE,
    };
  } catch {
    return null; // 못 읽으면 브라우저가 바로 읽는다
  }
}
