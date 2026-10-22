import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ResultClient } from "./ResultClient";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("카드의 대답");

export default function TarotResultPage() {
  return (
    <PhoneFrame>
      <BackHeader title="카드의 대답" href="/tarot/draw" />
      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-6 pt-2">
        <Suspense>
          <ResultClient />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}
