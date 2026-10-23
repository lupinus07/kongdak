import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * 관리자 페이지 인증. 환경변수 ADMIN_PASSWORD(서버 전용, NEXT_PUBLIC_ 금지)와 맞는 비밀번호를 입력하면
 * 만료 시각을 서명한 쿠키를 발급한다. 쿠키에는 비밀번호가 들어가지 않고, 비밀번호를 바꾸면 기존 쿠키는 모두 무효가 된다.
 * ADMIN_PASSWORD가 비어 있으면 관리자 페이지는 아무도 열 수 없다.
 */

export const ADMIN_COOKIE = "kongdak_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

function sign(value: string, password: string) {
  return createHmac("sha256", password).update(`kongdak-admin:${value}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const [x, y] = [Buffer.from(a), Buffer.from(b)];
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkAdminPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return !!password && safeEqual(input, password);
}

export function createAdminToken(now = Date.now()): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const expires = String(now + ADMIN_SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires, password)}`;
}

export function verifyAdminToken(token: string | undefined, now = Date.now()): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return safeEqual(signature, sign(expires, password));
}
