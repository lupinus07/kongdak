import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { privateMetadata } from "@/lib/site";
import { InquiryForm } from "./InquiryForm";

export const metadata = privateMetadata("문의하기");

export default function NewInquiryPage() {
  return (
    <PhoneFrame>
      <BackHeader title="문의하기" href="/inquiry" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <InquiryForm />
      </main>
    </PhoneFrame>
  );
}
