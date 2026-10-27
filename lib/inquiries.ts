import type { InquiryDetail } from "@/lib/inquiry-shared";
import { createClient } from "@/lib/supabase/server";

/** 문의 게시판 서버 쪽 도우미. 목록·글 읽기는 브라우저(lib/inquiry-board.ts)가 DB 함수로 한다. */

/**
 * 지금 로그인한 사용자 id (없으면 null).
 * getClaims는 로그인 토큰 서명을 서버 안에서 확인해서 Supabase Auth까지 다녀오지 않는다(비대칭 서명 키일 때).
 * 예전 대칭 키 프로젝트면 알아서 getUser로 확인한다.
 */
export async function currentUserId(): Promise<string | null> {
  const { data } = await (await createClient()).auth.getClaims();
  return data?.claims?.sub ?? null;
}

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
