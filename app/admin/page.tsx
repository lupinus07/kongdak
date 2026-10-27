import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { loadAdminInquiries } from "@/lib/admin-inquiries";
import { loadAdminStats } from "@/lib/admin-stats";
import { privateMetadata } from "@/lib/site";
import { Dashboard } from "./Dashboard";
import { LoginForm } from "./LoginForm";

export const metadata = privateMetadata("관리자");

export default function AdminPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <Suspense fallback={<p className="m-auto text-ink-sub">불러오는 중…</p>}>
        <AdminBody />
      </Suspense>
    </div>
  );
}

async function AdminBody() {
  // 로그인 여부와 주문 집계는 요청마다 달라지므로 미리 그리지 않는다
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <LoginForm />
      </main>
    );
  }
  const [stats, inquiries] = await Promise.all([loadAdminStats(), loadAdminInquiries()]);
  return <Dashboard stats={stats} inquiries={inquiries} />;
}
