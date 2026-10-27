import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { loadInquiryForViewer } from "@/lib/inquiries";
import { privateMetadata } from "@/lib/site";
import { InquiryView } from "../InquiryView";
import { UnlockForm } from "./UnlockForm";

export const metadata = privateMetadata("문의");

export default function InquiryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <PhoneFrame>
      <BackHeader title="문의" href="/inquiry" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <Suspense fallback={<p className="m-0 text-center text-ink-sub">불러오는 중…</p>}>
          <Body params={params} />
        </Suspense>
        <Link href="/inquiry" className="text-center text-[14px] text-brand no-underline">
          목록으로 ›
        </Link>
      </main>
    </PhoneFrame>
  );
}

async function Body({ params }: { params: Promise<{ code: string }> }) {
  // 로그인 상태(쿠키)에 따라 달라서 요청 때 그린다
  await connection();
  const code = (await params).code.toUpperCase();
  if (!/^[0-9A-F]{8}$/.test(code)) return <p className="m-0 text-center text-ink-sub">문의를 찾지 못했어요.</p>;
  // 로그인한 본인 글이면 비밀번호 없이 바로 연다
  const found = await loadInquiryForViewer(code);
  if (!found) return <p className="m-0 text-center text-ink-sub">문의를 찾지 못했어요.</p>;
  if ("own" in found) return <InquiryView q={found.own} />;
  const { category, createdAt } = found.locked;
  return <UnlockForm code={code} category={category} date={createdAt.slice(0, 10).replaceAll("-", ".")} />;
}
