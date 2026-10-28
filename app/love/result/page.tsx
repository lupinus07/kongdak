import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PollRefresh } from "@/components/PollRefresh";
import { WaitingSteps } from "@/components/WaitingSteps";
import { ResultLinkBox } from "@/components/ResultLinkBox";
import { ReviewForm } from "@/components/ReviewForm";
import { Chap, Disclaimer, H, Li, P, Sec } from "@/components/report";
import { SajuCards } from "@/components/SajuCards";
import { SajuChart } from "@/components/SajuChart";
import { birthLabel } from "@/lib/birth";
import { openLoveReading } from "@/lib/love-reading-server";
import { loadPaidOrder } from "@/lib/orders-server";
import type { Saju } from "@/lib/saju";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("나의 연애운 결과");

// AI 풀이를 처음 열 때 만들기 때문에 시간이 걸릴 수 있다(응답 뒤 after()에서 이어서 만든다)
export const maxDuration = 300;

function Waiting({ poll, saju, input }: { poll?: boolean; saju?: Saju; input?: { situation?: string; gender?: string } }) {
  return (
    <main className={`flex flex-1 flex-col gap-4 px-[18px] text-center ${saju ? "pb-8 pt-4" : "justify-center"}`}>
      {/* 스크롤해서 아래 미리보기를 읽는 동안에도 진행 상황이 보이도록 헤더 아래에 붙여 둔다 */}
      {poll ? (
        <div className="sticky top-[76px] z-10 -mx-[18px] bg-bg px-[18px] py-2">
          <WaitingSteps />
        </div>
      ) : null}
      {/* poll이 아닐 때는 아직 풀이가 새로 만들어지는 중인지, 저장된 풀이를 읽는 중인지 모른다 */}
      {poll ? (
        <>
          <p className="m-0 text-ink-sub">
            풀이를 정성껏 쓰는 중이에요. 1분 정도 걸릴 수 있어요.
            <br />
            결제는 끝났으니 나가도 괜찮아요.
          </p>
          <Suspense fallback={null}>
            <ResultLinkBox product="love" waiting />
          </Suspense>
        </>
      ) : (
        <p className="m-0 text-ink-sub">풀이를 불러오고 있어요…</p>
      )}
      {/* 진행 상황은 위에 두고, 기다리는 동안 읽을 수 있게 결제 전 미리보기와 같은 내용을 아래에 보여준다 */}
      {saju && (
        <Sec className="text-left">
          <Chap>나의 사주 원국</Chap>
          <SajuChart saju={saju} />
          <SajuCards saju={saju} situation={input?.situation} gender={input?.gender} />
        </Sec>
      )}
      {poll && <PollRefresh />}
    </main>
  );
}

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

export default function LoveResultPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  return (
    <PhoneFrame>
      <BackHeader title="나의 연애운" href="/" />
      <Suspense fallback={<Waiting />}>
        <LoveResultBody searchParams={searchParams} />
      </Suspense>
    </PhoneFrame>
  );
}

async function LoveResultBody({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  // 결제 후 요청마다 달라지는 화면이라 미리 그리지 않고, 요청 때 처리한다(Date.now() 등 사용 가능).
  await connection();
  const { t } = await searchParams;
  const order = await loadPaidOrder(t, "love");
  if (!order) return <Notice>결제한 풀이를 찾지 못했어요.</Notice>;
  // 주문·풀이·후기를 한 번에 읽어 왔으니(loadPaidOrder) 여기서는 DB를 다시 읽지 않는다
  const result = await openLoveReading(order.id, order.input, order.reading);
  if (!result.ok) {
    return result.reason === "no-birth" ? (
      <Notice>생년월일 정보가 없는 주문이라 사주를 계산할 수 없어요.</Notice>
    ) : (
      <Waiting poll saju={result.saju} input={order.input} />
    );
  }
  const { saju, reading: r, input } = result;
  const myReview = order.review;

  return (
    <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">
      <ResultLinkBox product="love" orderCode={order.orderCode} />
      <section className="flex flex-col gap-2 rounded-[30px] bg-brand px-5 py-6 text-white">
        <span className="text-[14px] text-[#FFE3EC]">{birthLabel(input.birth ?? "", input.calendar, input.time)}</span>
        <h1 className="m-0 font-title text-[28px] font-normal leading-[1.3]">
          {r.hero.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="m-0 text-[15px] leading-[1.7] text-[#FFE3EC]">{r.hero.summary}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {r.hero.tags.map((tag) => (
            <span key={tag} className="rounded-xl bg-white/20 px-[11px] py-[5px] text-[13.5px]">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {r.worryAnswer && input.worry && (
        <Sec className="bg-[#FFF7D6]">
          <Chap className="text-[#8A5A00]">내 고민 풀이</Chap>
          <p className="m-0 rounded-2xl bg-white/70 px-3.5 py-3 text-[14.5px] leading-[1.65] text-[#6B4A2B]">“{input.worry}”</p>
          <H className="text-[#5C3D00]">{r.worryAnswer.quote}</H>
          {r.worryAnswer.paragraphs.map((p, i) => (
            <P key={i} className="text-[#6B4A2B]">
              {p}
            </P>
          ))}
        </Sec>
      )}

      <Sec>
        <Chap>CHAPTER 1</Chap>
        <H>나의 사주 원국</H>
        <SajuChart saju={saju} />
        {/* 결제 전 미리보기와 같은 카드 + AI가 쓴 원국 요약 */}
        <SajuCards saju={saju} situation={input.situation} gender={input.gender} />
        <div className="mt-1 flex flex-col gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-[#F3B6CB] p-3.5">
          <b className="font-title text-[15px] font-normal text-brand">내 사주 한눈에 보기</b>
          <P>{r.pillarsNote}</P>
        </div>
      </Sec>

      <Sec>
        <Chap>CHAPTER 2</Chap>
        <H>
          나의 연애 DNA
          <br />“{r.dna.quote}”
        </H>
        {r.dna.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 3</Chap>
        <H>
          연애할 때의 나
          <br />“{r.me.quote}”
        </H>
        {r.me.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}
        {r.me.bullets.map((b, i) => (
          <Li key={i}>{b}</Li>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 4</Chap>
        <H>
          이성 인연
          <br />“{r.partner.quote}”
        </H>
        {r.partner.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 5</Chap>
        <H>나와 잘 맞는 사람</H>
        <P>{r.match.intro}</P>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-[18px] bg-[#E3F4E1] p-3">
            <b className="font-title text-[15px] font-normal text-[#2B6B2A]">잘 맞아요</b>
            <span className="text-[14px] leading-[1.55] text-[#335C32]">{r.match.good}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-[18px] bg-[#FFF1DE] p-3">
            <b className="font-title text-[15px] font-normal text-[#8A4B00]">한 번 더 생각해요</b>
            <span className="text-[14px] leading-[1.55] text-[#6B4A2B]">{r.match.careful}</span>
          </div>
        </div>
      </Sec>

      <Sec>
        <Chap>CHAPTER 6</Chap>
        <H>연애할 때 조심할 점</H>
        {r.caution.map((c, i) => (
          <Li key={i} dot="#F59F00">
            <b>{c.title}</b> {c.body}
          </Li>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 7</Chap>
        <H>다가오는 1년 연애 흐름</H>
        <P className="!text-[14px] text-[#5E3F4C]">절기 기준 · 하트가 많을수록 인연 기운이 강한 달</P>
        <div className="grid grid-cols-3 gap-1.5">
          {r.flow.months.map((m) => {
            const mark = m.caution ? "⚠" : "♥".repeat(Math.min(Math.max(m.hearts, 0), 3));
            const bg = m.caution ? "bg-[#FFF4E5]" : m.hearts >= 3 ? "bg-[#FFE3EC]" : "bg-[#FFF8FA]";
            return (
              <div key={m.month} className={`flex flex-col gap-[3px] rounded-2xl px-2 py-2.5 ${bg}`}>
                <b className="font-title text-[15px] font-normal text-ink">
                  {m.month} {mark}
                </b>
                <span className="text-[12.5px] leading-[1.4] text-[#6B4A58]">{m.text}</span>
              </div>
            );
          })}
        </div>
        <P>{r.flow.summary}</P>
      </Sec>

      <Sec className="bg-[#FFF7D6]">
        <Chap className="text-[#8A5A00]">콩닥 한마디</Chap>
        <H className="text-[#5C3D00]">
          {r.closing.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </H>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["행운의 색", r.closing.luckyColor],
            ["행운의 방향", r.closing.luckyDirection],
            ["행운의 시간", r.closing.luckyTime],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-1.5 py-2.5">
              <span className="text-[12.5px] text-ink-sub">{label}</span>
              <b className="font-title text-sm font-normal">{value}</b>
            </div>
          ))}
        </div>
        <P className="text-[#6B4A2B]">{r.closing.tip}</P>
      </Sec>

      {/* 다 읽은 뒤 맨 아래에서 후기를 받는다 */}
      <ReviewForm product="love" done={myReview} />

      <Disclaimer>재미와 참고를 위한 콘텐츠예요.</Disclaimer>
    </main>
  );
}
