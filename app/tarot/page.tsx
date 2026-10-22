import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TarotAskForm } from "./TarotAskForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "무료 연애 타로 - 짝사랑·속마음·재회 타로",
  description:
    "짝사랑, 그 사람 속마음, 썸 진행 상황, 이별·재회, 고백 타이밍 중 고민을 고르고 하루 한 장 무료로 연애 타로 카드를 뽑아 보세요. 정통 타로 78장으로 정방향·역방향 풀이를 알려 드려요.",
  path: "/tarot",
});

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
