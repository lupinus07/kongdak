import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CoupleTitle } from "@/components/icons/Characters";
import { CompatForm } from "./CompatForm";

export const metadata = { title: "둘의 궁합 - 콩닥" };

export default function CompatPage() {
  return (
    <PhoneFrame>
      <BackHeader title="둘의 궁합" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <h1 className="m-0 font-title text-[27px] font-normal leading-snug">
            우리 둘,
            <br />
            얼마나 잘 맞을까?
          </h1>
          <CoupleTitle />
        </div>
        <CompatForm />
      </main>
    </PhoneFrame>
  );
}
