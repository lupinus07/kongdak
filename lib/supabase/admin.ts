import { createClient } from "@supabase/supabase-js";

/** service_role 권한 클라이언트. orders·readings 기록처럼 서버에서만 하는 쓰기에 쓴다. 클라이언트 코드에서 import 금지. */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
