import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TarotAskForm } from "./TarotAskForm";

export const metadata = { title: "콩닥 타로 - 콩닥" };

export default function TarotPage() {
  return (
    <PhoneFrame>
      <BackHeader title="콩닥 타로" />
      <main className="flex flex-1 flex-col gap-[18px] px-[22px] pb-6 pt-2">
        <TarotAskForm />
      </main>
    </PhoneFrame>
  );
}
