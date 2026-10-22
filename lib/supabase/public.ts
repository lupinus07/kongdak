import { createClient } from "@supabase/supabase-js";

/** 로그인과 상관없는 공개 데이터(타로 카드·풀이 등) 읽기용. 쿠키를 쓰지 않아 서버 어디서나 쓸 수 있다. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
