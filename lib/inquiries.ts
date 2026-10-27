import type { InquiryDetail } from "@/lib/inquiry-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** 문의 게시판 읽기 (서버 전용). 목록에는 내용·주문번호·연락처를 싣지 않는다. */

export const PAGE_SIZE = 15;

export type InquiryListItem = { code: string; category: string; createdAt: string; answered: boolean; mine: boolean };

/**
 * 지금 로그인한 사용자 id (없으면 null).
 * getClaims는 로그인 토큰 서명을 서버 안에서 확인해서 Supabase Auth까지 다녀오지 않는다(비대칭 서명 키일 때).
 * 예전 대칭 키 프로젝트면 알아서 getUser로 확인한다.
 */
export async function currentUserId(): Promise<string | null> {
  const { data } = await (await createClient()).auth.getClaims();
  return data?.claims?.sub ?? null;
}

/**
 * 목록 한 쪽. 로그인 확인과 목록 읽기를 동시에 해서 기다리는 시간을 줄인다.
 * '내 문의'만 로그인 id가 있어야 목록을 읽을 수 있어서 순서대로 한다.
 */
export async function listInquiries({ page, mineOnly }: { page: number; mineOnly: boolean }) {
  const userIdP = currentUserId();
  if (mineOnly) {
    const userId = await userIdP;
    if (!userId) return { userId, items: [] as InquiryListItem[], hasNext: false };
    return { userId, ...toPage(await readRows(page, userId), userId) };
  }
  const [userId, rows] = await Promise.all([userIdP, readRows(page, null)]);
  return { userId, ...toPage(rows, userId) };
}

type ListRow = { code: string; category: string; created_at: string; answered_at: string | null; user_id: string | null };

async function readRows(page: number, onlyUserId: string | null): Promise<ListRow[]> {
  let q = createAdminClient().from("inquiries").select("code, category, created_at, answered_at, user_id");
  if (onlyUserId) q = q.eq("user_id", onlyUserId);
  const from = (page - 1) * PAGE_SIZE;
  // 한 개 더 읽어서 다음 쪽이 있는지 본다
  const { data } = await q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE);
  return data ?? [];
}

function toPage(rows: ListRow[], userId: string | null) {
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

/**
 * 상세 화면: 로그인 확인과 문의 읽기를 동시에 한다.
 * 로그인한 본인 글이면 내용까지 돌려주고(비밀번호 없이 열기), 아니면 잠금 화면에 쓸 종류·날짜만 돌려준다.
 */
export async function loadInquiryForViewer(
  code: string,
): Promise<{ own: InquiryDetail } | { locked: { category: string; createdAt: string } } | null> {
  const [userId, { data }] = await Promise.all([
    currentUserId(),
    createAdminClient().from("inquiries").select(`${DETAIL}, user_id`).eq("code", code).maybeSingle(),
  ]);
  if (!data) return null;
  if (userId && data.user_id === userId) return { own: toDetail(data) };
  return { locked: { category: data.category, createdAt: data.created_at } };
}
