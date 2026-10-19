import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TarotAskForm } from "./TarotAskForm";

export const metadata = { title: "콩닥 타로 - 콩닥" };

export default function TarotPage() {
  return (
    <PhoneFrame>
      <BackHeader title="콩닥 타로" />
      <main className="flex flex-1 flex-col gap-[18px] px-[22px] pb-6 pt-2">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-title text-[28px] font-normal leading-tight">
            요즘 어떤 고민이
            <br />
            있어요?
          </h1>
          <p className="m-0 text-[15px] text-ink-sub">고민을 고르면 카드가 답해줄게요</p>
        </div>
        <TarotAskForm />
      </main>
    </PhoneFrame>
  );
}
