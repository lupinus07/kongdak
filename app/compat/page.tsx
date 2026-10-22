import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CoupleTitle } from "@/components/icons/Characters";
import { CompatForm } from "./CompatForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "둘의 궁합 - 생년월일 사주 궁합",
  description:
    "나와 그 사람의 생년월일로 보는 사주 궁합. 콩닥지수(궁합 점수)와 잘 맞는 점, 조심할 점, 더 가까워지는 팁까지 알려 드려요.",
  path: "/compat",
});

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
