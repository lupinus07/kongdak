import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Chap, Disclaimer, H, Sec, Skeleton } from "@/components/report";
import { SajuChart } from "@/components/SajuChart";
import { checkBirthDate } from "@/lib/birth";
import { calcSaju, type Saju } from "@/lib/saju";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-[22px] text-center">
      <p className="m-0 text-ink-sub">{children}</p>
      <Link
        href="/love"
        className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline"
      >
        나의 연애운 보러 가기
      </Link>
    </main>
  );
}

/** 결제가 끝난 본인의 주문인지 확인하고, 입력값으로 사주 원국을 계산해 readings.saju에 저장한다. */
async function loadSaju(orderId: string | undefined): Promise<Saju | "not-found" | "no-birth"> {
  if (!orderId) return "not-found";
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, product_code, status, input")
    .eq("id", orderId)
    .maybeSingle(); // RLS: 본인 주문만 조회된다
  if (!order || order.status !== "DONE" || order.product_code !== "love")
    return "not-found";

  const input = order.input as {
    birth?: string;
    calendar?: string;
    time?: string;
  };
  if (!input.birth || checkBirthDate(input.birth) !== "ok") return "no-birth";
  const saju = calcSaju({
    birth: input.birth,
    calendar: input.calendar ?? "양력",
    time: input.time ?? "",
  });

  // 사주 원국은 AI 풀이가 아니라 열람 기록(opened_at)은 남기지 않는다. 이미 저장돼 있으면 건드리지 않는다.
  await createAdminClient()
    .from("readings")
    .update({ saju })
    .eq("order_id", order.id)
    .is("saju", null);
  return saju;
}

export default function LoveResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <PhoneFrame>
      <BackHeader title="나의 연애운" href="/" />
      <Suspense fallback={<Notice>풀이를 불러오고 있어요…</Notice>}>
        <LoveResultBody searchParams={searchParams} />
      </Suspense>
    </PhoneFrame>
  );
}

async function LoveResultBody({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  // 결제 후 요청마다 달라지는 화면이라 미리 그리지 않고, 요청 때 처리한다(Date.now() 등 사용 가능).
  await connection();
  const { order } = await searchParams;
  const saju = await loadSaju(order);
  if (saju === "not-found") return <Notice>결제한 풀이를 찾지 못했어요.</Notice>;
  if (saju === "no-birth") return <Notice>생년월일 정보가 없는 주문이라 사주를 계산할 수 없어요.</Notice>;

  return (
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

          {c.pillars && <SajuChart saju={saju} />}

          {c.split && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#E3F4E1] p-3">
                <b className="font-title text-[15px] font-normal text-[#2B6B2A]">
                  잘 맞아요
                </b>
                <Skeleton lines={3} tone="#C9E6C6" />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#FFF1DE] p-3">
                <b className="font-title text-[15px] font-normal text-[#8A4B00]">
                  한 번 더 생각해요
                </b>
                <Skeleton lines={3} tone="#F5DDB9" />
              </div>
            </div>
          )}

          {c.months && (
            <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 rounded-2xl bg-[#FFF8FA] px-2 py-2.5"
                >
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
            <div
              key={l}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-1.5 py-3"
            >
              <div className="size-6 rounded-full bg-[#F6DCE5]" />
              <span className="text-[11.5px] text-ink-sub">{l}</span>
              <div className="h-3.5 w-10 rounded bg-[#F6DCE5]" />
            </div>
          ))}
        </div>
      </Sec>

      <Disclaimer>재미와 참고를 위한 콘텐츠예요.</Disclaimer>
    </main>
  );
}
