"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { ANSWER_MAX, INQUIRY_CATEGORIES, INQUIRY_MAX, INQUIRY_MIN, type InquiryCategory } from "@/lib/inquiry-shared";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notifyTelegram } from "@/lib/telegram";

/** 1:1 문의: 받기(누구나) · 답변 확인(문의번호 + 뒷자리) · 답하기(관리자). 모두 서버에서만 DB를 읽고 쓴다. */

export type CreateState = { code?: string; error?: string };

export async function createInquiry(_prev: CreateState, formData: FormData): Promise<CreateState> {
  // 사람 눈에 안 보이는 칸. 채워져 있으면 자동으로 글을 올리는 봇이라 조용히 성공한 척만 한다.
  if (String(formData.get("website") ?? "")) return { code: "--------" };

  const category = String(formData.get("category") ?? "") as InquiryCategory;
  if (!INQUIRY_CATEGORIES.includes(category)) return { error: "문의 종류를 골라 주세요." };
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < INQUIRY_MIN) return { error: `내용을 ${INQUIRY_MIN}자 이상 적어 주세요.` };
  if (content.length > INQUIRY_MAX) return { error: `내용은 ${INQUIRY_MAX}자까지 적을 수 있어요.` };
  const phoneLast4 = String(formData.get("phoneLast4") ?? "");
  if (!/^\d{4}$/.test(phoneLast4)) return { error: "휴대폰 번호 뒷자리 4자리를 입력해 주세요." };
  const rawOrder = String(formData.get("orderCode") ?? "").trim().toUpperCase();
  if (rawOrder && !/^[0-9A-F]{8}$/.test(rawOrder)) return { error: "주문번호는 영문·숫자 8자리예요. 모르면 비워 두세요." };

  const { data: auth } = await (await createClient()).auth.getUser();
  const { data, error } = await createAdminClient()
    .from("inquiries")
    .insert({ user_id: auth.user?.id ?? null, category, content, phone_last4: phoneLast4, order_code: rawOrder || null })
    .select("code")
    .single();
  if (error || !data) {
    console.error("문의 저장 실패", error?.message);
    return { error: "문의를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
  }
  // 응답을 늦추지 않게 알림은 응답 뒤에 보낸다. 내용은 싣지 않는다.
  after(() => notifyTelegram(`콩닥 새 문의가 왔어요 [${category}]\n${SITE_URL}/admin`));
  return { code: data.code };
}

export type FoundInquiry = {
  code: string;
  category: string;
  content: string;
  createdAt: string;
  answer: string | null;
  answeredAt: string | null;
};
export type FindState = { inquiry?: FoundInquiry; error?: string };

export async function findInquiry(_prev: FindState, formData: FormData): Promise<FindState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const phoneLast4 = String(formData.get("phoneLast4") ?? "");
  if (!/^[0-9A-F]{8}$/.test(code) || !/^\d{4}$/.test(phoneLast4)) {
    return { error: "문의번호 8자리와 휴대폰 뒷자리 4자리를 확인해 주세요." };
  }
  const { data } = await createAdminClient()
    .from("inquiries")
    .select("code, category, content, created_at, answer, answered_at")
    .eq("code", code)
    .eq("phone_last4", phoneLast4)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) {
    await new Promise((r) => setTimeout(r, 800)); // 번호를 연달아 대입하기 어렵게 늦춘다
    return { error: "문의를 찾지 못했어요. 문의번호와 뒷자리를 다시 확인해 주세요." };
  }
  return {
    inquiry: {
      code: data.code,
      category: data.category,
      content: data.content,
      createdAt: data.created_at,
      answer: data.answer,
      answeredAt: data.answered_at,
    },
  };
}

export type AnswerState = { ok?: boolean; error?: string };

/** 관리자 답변. 관리자 쿠키를 다시 확인한다(서버 액션은 페이지와 따로 불릴 수 있다). */
export async function answerInquiry(_prev: AnswerState, formData: FormData): Promise<AnswerState> {
  if (!verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value)) return { error: "다시 로그인해 주세요." };
  const id = String(formData.get("id") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  if (!answer) return { error: "답변을 적어 주세요." };
  if (answer.length > ANSWER_MAX) return { error: `답변은 ${ANSWER_MAX}자까지 적을 수 있어요.` };
  const { error } = await createAdminClient()
    .from("inquiries")
    .update({ answer, answered_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "답변을 저장하지 못했어요." };
  revalidatePath("/admin");
  return { ok: true };
}
