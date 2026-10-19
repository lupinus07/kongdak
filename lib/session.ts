"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Session = { nickname: string };

/** 카카오 로그인 화면으로 이동한다. 끝나면 /auth/callback을 거쳐 next 경로로 돌아온다. */
export async function loginWithKakao(next = "/") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) alert("로그인을 시작하지 못했어요. 잠시 후 다시 해주세요.");
}

export async function logout() {
  await createClient().auth.signOut();
}

/** ready: 세션 확인이 끝난 뒤부터 true */
export function useSession(): { session: Session | null; ready: boolean } {
  const [state, setState] = useState<{ session: Session | null; ready: boolean }>({
    session: null,
    ready: false,
  });

  useEffect(() => {
    const supabase = createClient();
    const toSession = (user: { user_metadata?: Record<string, unknown> } | null | undefined): Session | null => {
      if (!user) return null;
      const m = user.user_metadata ?? {};
      const name = (m.name ?? m.full_name ?? m.nickname ?? m.preferred_username) as string | undefined;
      return { nickname: name || "콩닥이" };
    };
    supabase.auth.getUser().then(({ data }) => setState({ session: toSession(data.user), ready: true }));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setState({ session: toSession(s?.user), ready: true }),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}
