import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LoveTitle } from "@/components/icons/Characters";
import { LoveForm } from "./LoveForm";

export const metadata = { title: "나의 연애운 - 콩닥" };

export default function LovePage() {
  return (
    <PhoneFrame stickyCta>
      <BackHeader title="나의 연애운" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-title text-[27px] font-normal leading-snug">
              올해 내 연애,
              <br />
              어떻게 흘러갈까?
            </h1>
            <p className="m-0 text-sm text-ink-sub">내 사주로 꼼꼼하게 읽는 연애 흐름</p>
          </div>
          <LoveTitle />
        </div>
        <LoveForm />
      </main>
    </PhoneFrame>
  );
}
