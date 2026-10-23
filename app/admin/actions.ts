"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, checkAdminPassword, createAdminToken } from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) return { error: "서버에 ADMIN_PASSWORD가 설정되지 않았어요." };
  if (!checkAdminPassword(password)) {
    await new Promise((r) => setTimeout(r, 1000)); // 비밀번호를 연달아 대입하기 어렵게 늦춘다
    return { error: "비밀번호가 맞지 않아요." };
  }
  const token = createAdminToken()!;
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}
