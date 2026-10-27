import Link from "next/link";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { privateMetadata } from "@/lib/site";
import { DetailClient } from "./DetailClient";

export const metadata = privateMetadata("문의");

/** 화면 틀은 미리 만들어 두고, 글은 브라우저가 바로 읽어 온다(DetailClient). 비밀번호 확인만 서버에서 한다. */
export default function InquiryDetailPage() {
  return (
    <PhoneFrame>
      <BackHeader title="문의" href="/inquiry" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <Suspense fallback={<p className="m-0 text-center text-ink-sub">불러오는 중…</p>}>
          <DetailClient />
        </Suspense>
        <Link href="/inquiry" className="text-center text-[14px] text-brand no-underline">
          목록으로 ›
        </Link>
      </main>
    </PhoneFrame>
  );
}
