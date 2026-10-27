import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { currentUserId } from "@/lib/inquiries";
import { privateMetadata } from "@/lib/site";
import { InquiryForm } from "./InquiryForm";

export const metadata = privateMetadata("문의하기");

export default function NewInquiryPage() {
  return (
    <PhoneFrame>
      <BackHeader title="문의하기" href="/inquiry" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <Suspense fallback={null}>
          <Body />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}

async function Body() {
  // 로그인했으면 비밀번호를 선택으로 바꾼다
  await connection();
  return <InquiryForm loggedIn={!!(await currentUserId())} />;
}
