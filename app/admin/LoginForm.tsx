"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mx-auto flex w-full max-w-[340px] flex-col gap-3 rounded-[26px] bg-white p-6">
      <h1 className="m-0 font-title text-[24px] font-normal text-ink">콩닥 관리자</h1>
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="비밀번호"
        required
        className="h-12 rounded-2xl border-2 border-[#F3C6D6] bg-white px-4 text-[16px] outline-none focus:border-brand"
      />
      {state.error && <p className="m-0 text-[13px] text-brand">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-[24px] bg-brand font-title text-[17px] text-white disabled:opacity-50"
      >
        {pending ? "확인 중…" : "들어가기"}
      </button>
    </form>
  );
}
