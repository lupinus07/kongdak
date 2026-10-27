import { createAdminClient } from "@/lib/supabase/admin";

/** 관리자 화면 문의 목록: 답변 안 한 문의를 먼저, 그다음 최근 답변한 문의. 휴대폰 뒷자리는 싣지 않는다. */

export type AdminInquiry = {
  id: string;
  code: string;
  category: string;
  orderCode: string | null;
  content: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
};

const COLUMNS = "id, code, category, order_code, content, answer, created_at, answered_at";

type Row = {
  id: string;
  code: string;
  category: string;
  order_code: string | null;
  content: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
};

const toInquiry = (r: Row): AdminInquiry => ({
  id: r.id,
  code: r.code,
  category: r.category,
  orderCode: r.order_code,
  content: r.content,
  answer: r.answer,
  createdAt: r.created_at,
  answeredAt: r.answered_at,
});

export async function loadAdminInquiries(): Promise<{ open: AdminInquiry[]; answered: AdminInquiry[] }> {
  const admin = createAdminClient();
  const [open, answered] = await Promise.all([
    admin.from("inquiries").select(COLUMNS).is("answered_at", null).order("created_at", { ascending: true }).limit(100),
    admin.from("inquiries").select(COLUMNS).not("answered_at", "is", null).order("answered_at", { ascending: false }).limit(10),
  ]);
  return { open: (open.data ?? []).map(toInquiry), answered: (answered.data ?? []).map(toInquiry) };
}
