import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { privateMetadata } from "@/lib/site";
import { FindForm } from "./FindForm";

export const metadata = privateMetadata("결제한 풀이 다시 찾기");

export default function FindPage() {
  return (
    <PhoneFrame>
      <BackHeader title="결제한 풀이 찾기" href="/my" />
      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-8 pt-2">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-title text-[26px] font-normal leading-snug">
            결과 링크를
            <br />
            잃어버렸나요?
          </h1>
          <p className="m-0 text-sm text-ink-sub">로그인 없이 결제했다면 주문번호와 휴대폰 뒷자리로 찾을 수 있어요</p>
        </div>
        <FindForm />
      </main>
    </PhoneFrame>
  );
}
