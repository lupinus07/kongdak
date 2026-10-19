import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { DrawClient } from "./DrawClient";

export const metadata = { title: "카드 뽑기 - 콩닥" };

export default function TarotDrawPage() {
  return (
    <PhoneFrame>
      <BackHeader title="카드 뽑기" href="/tarot" />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pb-6 pt-2">
        <Suspense>
          <DrawClient />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}
