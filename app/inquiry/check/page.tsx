import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { privateMetadata } from "@/lib/site";
import { CheckForm } from "./CheckForm";

export const metadata = privateMetadata("문의 답변 확인");

export default function InquiryCheckPage() {
  return (
    <PhoneFrame>
      <BackHeader title="답변 확인하기" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <CheckForm />
      </main>
    </PhoneFrame>
  );
}
