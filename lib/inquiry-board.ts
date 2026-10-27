import { createClient } from "@/lib/supabase/client";
import { PAGE_SIZE, type InquiryDetail, type InquiryListItem } from "@/lib/inquiry-shared";

/**
 * 문의 게시판을 브라우저에서 바로 읽는다(결제내역처럼 서버를 거치지 않아 빠르다).
 * inquiries 표는 잠겨 있고, DB 함수(inquiry_list·inquiry_view)가 공개해도 되는 칸만 돌려준다.
 * 로그인했으면 로그인 정보가 함께 가서 '내 글' 여부와 내 글 내용이 채워진다.
 */

export async function fetchInquiryPage(page: number, mine: boolean): Promise<{ items: InquiryListItem[]; hasNext: boolean } | null> {
  const { data, error } = await createClient().rpc("inquiry_list", {
    p_offset: (page - 1) * PAGE_SIZE,
    p_limit: PAGE_SIZE + 1, // 한 개 더 읽어서 다음 쪽이 있는지 본다
    p_mine: mine,
  });
  if (error) return null;
  const rows = (data ?? []) as { code: string; category: string; created_at: string; answered: boolean; mine: boolean }[];
  return {
    items: rows.slice(0, PAGE_SIZE).map((r) => ({ code: r.code, category: r.category, createdAt: r.created_at, answered: r.answered, mine: r.mine })),
    hasNext: rows.length > PAGE_SIZE,
  };
}

export type InquiryLookup =
  | { kind: "own"; inquiry: InquiryDetail }
  | { kind: "locked"; category: string; createdAt: string }
  | { kind: "missing" }
  | { kind: "error" };

export async function fetchInquiryView(code: string): Promise<InquiryLookup> {
  const { data, error } = await createClient().rpc("inquiry_view", { p_code: code });
  if (error) return { kind: "error" };
  const r = (data ?? [])[0] as
    | { code: string; category: string; created_at: string; mine: boolean; content: string | null; answer: string | null; answered_at: string | null }
    | undefined;
  if (!r) return { kind: "missing" };
  if (r.mine && r.content !== null) {
    return {
      kind: "own",
      inquiry: { code: r.code, category: r.category, content: r.content, createdAt: r.created_at, answer: r.answer, answeredAt: r.answered_at },
    };
  }
  return { kind: "locked", category: r.category, createdAt: r.created_at };
}
