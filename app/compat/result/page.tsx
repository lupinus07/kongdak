import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { CompatReport, type CompatPerson } from "@/components/CompatReport";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PollRefresh } from "@/components/PollRefresh";
import { ResultLinkBox } from "@/components/ResultLinkBox";
import { ReviewForm } from "@/components/ReviewForm";
import { Chap, Disclaimer, Sec } from "@/components/report";
import { SajuChart } from "@/components/SajuChart";
import { COMPAT_STEPS, WaitingSteps } from "@/components/WaitingSteps";
import { birthLabel } from "@/lib/birth";
import { openCompatReading, type CompatSide } from "@/lib/compat-reading-server";
import { loadPaidOrder } from "@/lib/orders-server";
import { loadOrderReview } from "@/lib/reviews";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("우리의 궁합");

// AI 풀이를 처음 열 때 만들기 때문에 시간이 걸릴 수 있다(응답 뒤 after()에서 이어서 만든다)
export const maxDuration = 300;

const person = (s: CompatSide): CompatPerson => ({ label: s.label, saju: s.saju, dateLabel: birthLabel(s.birth, "양력", s.time) });

function Waiting({ poll, people }: { poll?: boolean; people?: [CompatSide, CompatSide] }) {
  return (
    <main className={`flex flex-1 flex-col gap-4 px-[18px] text-center ${people ? "pb-8 pt-4" : "justify-center"}`}>
      {/* 스크롤해서 아래 원국을 보는 동안에도 진행 상황이 보이도록 헤더 아래에 붙여 둔다 */}
      {poll ? (
        <div className="sticky top-[76px] z-10 -mx-[18px] bg-bg px-[18px] py-2">
          <WaitingSteps steps={COMPAT_STEPS} />
        </div>
      ) : null}
      {poll ? (
        <>
          <p className="m-0 text-ink-sub">
            두 사람의 궁합을 정성껏 쓰는 중이에요. 1분 정도 걸릴 수 있어요.
            <br />
            결제는 끝났으니 나가도 괜찮아요.
          </p>
          <Suspense fallback={null}>
            <ResultLinkBox product="compat" waiting />
          </Suspense>
        </>
      ) : (
        <p className="m-0 text-ink-sub">풀이를 불러오고 있어요…</p>
      )}
      {/* 기다리는 동안 두 사람의 원국(만세력 계산, AI 아님)을 먼저 보여준다 */}
      {people?.map((p) => (
        <Sec key={p.label} className="text-left">
          <Chap>
            {p.label}의 사주 원국 · {birthLabel(p.birth, "양력", p.time)}
          </Chap>
          <SajuChart saju={p.saju} dayLabel={`일주 · ${p.label}`} />
        </Sec>
      ))}
      {poll && <PollRefresh />}
    </main>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-[22px] text-center">
      <p className="m-0 text-ink-sub">{children}</p>
      <Link href="/compat" className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline">
        둘의 궁합 보러 가기
      </Link>
    </main>
  );
}

export default function CompatResultPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  return (
    <PhoneFrame>
      <BackHeader title="우리의 궁합" href="/" />
      <Suspense fallback={<Waiting />}>
        <CompatResultBody searchParams={searchParams} />
      </Suspense>
    </PhoneFrame>
  );
}

async function CompatResultBody({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  // 결제 후 요청마다 달라지는 화면이라 미리 그리지 않고, 요청 때 처리한다
  await connection();
  const { t } = await searchParams;
  const order = await loadPaidOrder(t, "compat");
  if (!order) return <Notice>결제한 풀이를 찾지 못했어요.</Notice>;
  const result = await openCompatReading(order.id, order.input);
  if (!result.ok) {
    return result.reason === "no-birth" ? (
      <Notice>생년월일 정보가 없는 주문이라 궁합을 계산할 수 없어요.</Notice>
    ) : (
      <Waiting poll people={[result.me, result.you]} />
    );
  }
  const myReview = await loadOrderReview(order.id);

  return (
    <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">
      <ResultLinkBox product="compat" orderCode={order.orderCode} />
      <CompatReport
        me={person(result.me)}
        you={person(result.you)}
        relation={result.relation}
        score={result.score}
        reading={result.reading}
      />

      {/* 다 읽은 뒤 맨 아래에서 후기를 받는다 */}
      <ReviewForm product="compat" done={myReview} />

      <Disclaimer>재미와 참고를 위한 콘텐츠예요.</Disclaimer>
    </main>
  );
}
