import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { MyClient } from "./MyClient";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("내 기록");

export default function MyPage() {
  return (
    <PhoneFrame>
      <BackHeader title="내 기록" />
      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-8 pt-2">
        <Suspense>
          <MyClient />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}
