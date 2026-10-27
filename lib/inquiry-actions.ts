"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { currentUserId, toDetail } from "@/lib/inquiries";
import { INQUIRIES_TAG } from "@/lib/inquiry-list-cache";
import { hashPassword, verifyPassword } from "@/lib/inquiry-password";
import {
  ANSWER_MAX,
  INQUIRY_CATEGORIES,
  INQUIRY_MAX,
  INQUIRY_MIN,
  PASSWORD_MAX,
  PASSWORD_MIN,
  type InquiryCategory,
  type InquiryDetail,
} from "@/lib/inquiry-shared";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyTelegram } from "@/lib/telegram";

/** 문의 게시판: 남기기(누구나) · 비밀번호로 열기 · 답하기(관리자). 모두 서버에서만 DB를 읽고 쓴다. */

export type CreateState = { code?: string; error?: string };

export async function createInquiry(_prev: CreateState, formData: FormData): Promise<CreateState> {
  // 사람 눈에 안 보이는 칸. 채워져 있으면 자동으로 글을 올리는 봇이라 조용히 성공한 척만 한다.
  if (String(formData.get("website") ?? "")) return { code: "--------" };

  const category = String(formData.get("category") ?? "") as InquiryCategory;
  if (!INQUIRY_CATEGORIES.includes(category)) return { error: "문의 종류를 골라 주세요." };
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < INQUIRY_MIN) return { error: `내용을 ${INQUIRY_MIN}자 이상 적어 주세요.` };
  if (content.length > INQUIRY_MAX) return { error: `내용은 ${INQUIRY_MAX}자까지 적을 수 있어요.` };
  const rawOrder = String(formData.get("orderCode") ?? "").trim().toUpperCase();
  if (rawOrder && !/^[0-9A-F]{8}$/.test(rawOrder)) return { error: "주문번호는 영문·숫자 8자리예요. 모르면 비워 두세요." };

  const userId = await currentUserId();
  // 로그인했으면 '내 문의'에서 바로 보니 비밀번호는 선택, 아니면 필수
  const password = String(formData.get("password") ?? "");
  if (password || !userId) {
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return { error: `비밀번호를 ${PASSWORD_MIN}~${PASSWORD_MAX}자로 정해 주세요.` };
    }
  }

  const { data, error } = await createAdminClient()
    .from("inquiries")
    .insert({
      user_id: userId,
      category,
      content,
      order_code: rawOrder || null,
      password_hash: password ? hashPassword(password) : null,
    })
    .select("code")
    .single();
  if (error || !data) {
    console.error("문의 저장 실패", error?.message);
    return { error: "문의를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
  }
  // 응답을 늦추지 않게 알림은 응답 뒤에 보낸다. 내용은 싣지 않는다.
  after(() => notifyTelegram(`콩닥 새 문의가 왔어요 [${category}]\n${SITE_URL}/admin`));
  updateTag(INQUIRIES_TAG); // 미리 만든 첫 쪽 목록을 바로 새로 만든다
  revalidatePath("/inquiry");
  return { code: data.code };
}

export type OpenState = { inquiry?: InquiryDetail; error?: string };

const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

/**
 * 비밀번호로 문의 열기. 목록에 문의번호가 공개되므로 한 문의에 5번 틀리면 10분 동안 잠근다.
 * 예전 문의(비밀번호 칸이 생기기 전)는 휴대폰 뒷자리로 연다.
 */
export async function openInquiry(code: string, _prev: OpenState, formData: FormData): Promise<OpenState> {
  const password = String(formData.get("password") ?? "");
  if (!/^[0-9A-F]{8}$/.test(code) || !password) return { error: "비밀번호를 입력해 주세요." };
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("inquiries")
    .select("id, code, category, content, created_at, answer, answered_at, password_hash, phone_last4, failed_attempts, locked_until")
    .eq("code", code)
    .maybeSingle();
  if (!row) return { error: "문의를 찾지 못했어요." };
  if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
    return { error: "비밀번호를 여러 번 틀려서 잠시 잠겼어요. 10분 뒤에 다시 시도해 주세요." };
  }

  const ok = row.password_hash ? verifyPassword(password, row.password_hash) : !!row.phone_last4 && row.phone_last4 === password;
  if (!ok) {
    const fails = (row.failed_attempts ?? 0) + 1;
    const lock = fails >= MAX_FAILS;
    await admin
      .from("inquiries")
      .update({ failed_attempts: lock ? 0 : fails, locked_until: lock ? new Date(Date.now() + LOCK_MS).toISOString() : null })
      .eq("id", row.id);
    await new Promise((r) => setTimeout(r, 600)); // 연달아 대입하기 어렵게 늦춘다
    return {
      error: lock
        ? "비밀번호를 여러 번 틀려서 잠시 잠겼어요. 10분 뒤에 다시 시도해 주세요."
        : `비밀번호가 맞지 않아요. (${MAX_FAILS - fails}번 더 틀리면 10분 동안 잠겨요)`,
    };
  }
  if (row.failed_attempts) await admin.from("inquiries").update({ failed_attempts: 0 }).eq("id", row.id);
  return { inquiry: toDetail(row) };
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
  updateTag(INQUIRIES_TAG); // 목록의 '답변 완료' 표시를 바로 바꾼다
  revalidatePath("/admin");
  revalidatePath("/inquiry");
  return { ok: true };
}
