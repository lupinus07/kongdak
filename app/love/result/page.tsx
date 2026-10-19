import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Chap, Disclaimer, H, Sec, Skeleton } from "@/components/report";

export const metadata = { title: "나의 연애운 - 콩닥" };

const CHAPTERS = [
  { label: "CHAPTER 1", title: "나의 사주 원국", pillars: true },
  { label: "CHAPTER 2", title: "나의 연애 DNA" },
  { label: "CHAPTER 3", title: "연애할 때의 나" },
  { label: "CHAPTER 4", title: "이성 인연" },
  { label: "CHAPTER 5", title: "나와 잘 맞는 사람", split: true },
  { label: "CHAPTER 6", title: "연애할 때 조심할 점" },
  { label: "CHAPTER 7", title: "다가오는 1년 연애 흐름", months: true },
];

// TODO: ?order= 로 주문을 확인하고 readings에서 풀이를 불러온다. 지금은 레이아웃만 보여준다.
export default function LoveResultPage() {
  return (
    <PhoneFrame>
      <BackHeader title="나의 연애운" href="/" />
      <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">
        <section className="flex flex-col gap-3 rounded-[30px] bg-brand px-5 py-6">
          <Skeleton lines={1} tone="rgba(255,255,255,0.25)" />
          <div className="flex flex-col gap-2.5" aria-hidden="true">
            <div className="h-7 w-3/4 rounded-lg bg-white/25" />
            <div className="h-7 w-1/2 rounded-lg bg-white/25" />
          </div>
          <Skeleton lines={3} tone="rgba(255,255,255,0.2)" />
          <div className="mt-1 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-7 w-20 rounded-xl bg-white/20" />
            ))}
          </div>
        </section>

        {CHAPTERS.map((c) => (
          <Sec key={c.label}>
            <Chap>{c.label}</Chap>
            <H>{c.title}</H>

            {c.pillars && (
              <div className="grid grid-cols-4 justify-items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="h-3 w-8 rounded bg-[#F6DCE5]" />
                    <div className="size-[62px] rounded-[18px] bg-[#F6DCE5]" />
                    <div className="size-[62px] rounded-[18px] bg-[#F6DCE5]" />
                  </div>
                ))}
              </div>
            )}

            {c.split && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#E3F4E1] p-3">
                  <b className="font-title text-[15px] font-normal text-[#2B6B2A]">잘 맞아요</b>
                  <Skeleton lines={3} tone="#C9E6C6" />
                </div>
                <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#FFF1DE] p-3">
                  <b className="font-title text-[15px] font-normal text-[#8A4B00]">한 번 더 생각해요</b>
                  <Skeleton lines={3} tone="#F5DDB9" />
                </div>
              </div>
            )}

            {c.months && (
              <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-1.5 rounded-2xl bg-[#FFF8FA] px-2 py-2.5">
                    <div className="h-3.5 w-12 rounded bg-[#F6DCE5]" />
                    <div className="h-3 w-full rounded bg-[#F6DCE5]" />
                    <div className="h-3 w-2/3 rounded bg-[#F6DCE5]" />
                  </div>
                ))}
              </div>
            )}

            <Skeleton lines={c.split || c.months ? 2 : 4} />
          </Sec>
        ))}

        <Sec className="bg-[#FFF7D6]">
          <Chap className="text-[#8A5A00]">콩닥 한마디</Chap>
          <Skeleton lines={2} tone="#F3E3A6" />
          <div className="grid grid-cols-3 gap-2">
            {["행운의 색", "행운의 방향", "행운의 시간"].map((l) => (
              <div key={l} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-1.5 py-3">
                <div className="size-6 rounded-full bg-[#F6DCE5]" />
                <span className="text-[11.5px] text-ink-sub">{l}</span>
                <div className="h-3.5 w-10 rounded bg-[#F6DCE5]" />
              </div>
            ))}
          </div>
        </Sec>

        <Disclaimer>재미와 참고를 위한 콘텐츠예요.</Disclaimer>
      </main>
    </PhoneFrame>
  );
}
