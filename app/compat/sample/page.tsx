import Link from "next/link";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Chap, Disclaimer, H, Li, P, Sec } from "@/components/report";
import { SajuChart } from "@/components/SajuChart";
import { calcSaju } from "@/lib/saju";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "궁합 샘플 풀이 - 사주 궁합 미리 보기",
  description:
    "콩닥 사주 궁합 풀이가 어떻게 나오는지 샘플로 먼저 확인해 보세요. 콩닥지수(궁합 점수), 오행으로 보는 우리, 잘 맞는 점, 조심할 점, 더 가까워지는 팁까지 담겨 있어요.",
  path: "/compat/sample",
});

/**
 * 고정 샘플 풀이(API 호출 없음). 원국은 만세력 엔진으로 계산하고, 글은 그 계산값(일간·합충·오행)을 근거로 미리 써 두었다.
 * 남편 시간은 오후 5시 추정 → 신시(申時). 17:30이 넘으면 유시(酉時)인데, 그때도 부부궁이 금국으로 이어지는 큰 흐름은 같다.
 */
const WIFE = calcSaju({ birth: "1988.03.15", calendar: "양력", time: "0" });
const HUSBAND = calcSaju({ birth: "1988.06.15", calendar: "양력", time: "8" });

const SCORE = 92;
const RING = 2 * Math.PI * 70;

const stroke = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Person({ role, label }: { role: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-lg bg-[#FFE3EC] px-2 py-[3px] font-title text-[13px] text-brand">{role}</span>
      <span className="text-[13px] text-ink-sub">{label}</span>
    </div>
  );
}

/** 내게 없는 오행 → 상대가 가진 글자 */
function Fill({ who, missing, from, chars }: { who: string; missing: string; from: string; chars: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[18px] bg-[#FFF8FA] p-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[12.5px] text-ink-sub">{who}에게 없는 기운</span>
        <b className="font-title text-[17px] font-normal text-ink">{missing}</b>
      </div>
      <svg {...stroke} stroke="#FF6B9A">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
        <span className="text-[12.5px] text-ink-sub">{from}가 채워 줘요</span>
        <b className="font-hanja text-[17px] font-normal text-brand">{chars}</b>
      </div>
    </div>
  );
}

function Point({ title, tone, children }: { title: string; tone: "good" | "care" | "tip"; children: React.ReactNode }) {
  const style = {
    good: { bg: "#FFE3EC", color: "#C2255C", icon: "M5 12l5 5L20 7" },
    care: { bg: "#FFF1DE", color: "#C25A00", icon: "M12 7v6M12 17v.5" },
    tip: { bg: "#E3F4E1", color: "#2B6B2A", icon: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" },
  }[tone];
  return (
    <div className="flex items-start gap-3 rounded-[20px] bg-[#FFF8FA] px-3.5 py-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: style.bg }}>
        <svg {...stroke} stroke={style.color}>
          <path d={style.icon} />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <b className="font-title text-[15.5px] font-normal text-ink">{title}</b>
        <p className="m-0 text-[14.5px] leading-[1.7] text-[#5E3F4C]">{children}</p>
      </div>
    </div>
  );
}

function Lucky({ label, value, swatch }: { label: string; value: string; swatch: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-1.5 py-2.5">
      {swatch}
      <span className="text-[12.5px] text-ink-sub">{label}</span>
      <b className="font-title text-sm font-normal">{value}</b>
    </div>
  );
}

export default function CompatSamplePage() {
  return (
    <PhoneFrame>
      <BackHeader
        href="/compat"
        center={<span className="rounded-[14px] bg-badge px-3.5 py-1.5 text-[14px] text-[#5C3D00]">샘플 궁합</span>}
      />
      <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">
        <section className="flex flex-col items-center gap-2.5 rounded-[30px] bg-brand px-5 py-6 text-center text-white">
          <span className="text-[14px] text-[#FFE3EC]">부부 · 1988년생 동갑</span>
          <div className="relative size-[150px]">
            <svg width="150" height="150" viewBox="0 0 168 168" aria-hidden="true">
              <circle cx="84" cy="84" r="70" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="16" />
              <circle
                cx="84"
                cy="84"
                r="70"
                fill="none"
                stroke="#FFD43B"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(RING * SCORE) / 100} ${RING}`}
                transform="rotate(-90 84 84)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] text-[#FFE3EC]">콩닥지수</span>
              <span className="font-title text-[46px] leading-none">
                {SCORE}
                <span className="text-xl">%</span>
              </span>
            </div>
          </div>
          <h1 className="m-0 font-title text-[27px] font-normal leading-[1.3]">
            흙이 품어 빛나는
            <br />
            보석 같은 부부
          </h1>
          <p className="m-0 text-[15px] leading-[1.7] text-[#FFE3EC]">
            아내의 흙 기운이 남편의 보석을 품고 키워 주는 사이예요. 서로에게 없는 기운을 상대가 꼭 쥐고 있어서, 함께 있을수록 균형이
            맞아지는 궁합이에요. 챙겨 주는 마음이 잔소리로 들리지 않게 말의 온도만 맞추면 더 좋아요.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-1.5">
            {["서로_채워주는_사이", "친구같은_부부", "동갑내기_찰떡"].map((t) => (
              <span key={t} className="rounded-xl bg-white/20 px-[11px] py-[5px] text-[13.5px]">
                #{t}
              </span>
            ))}
          </div>
        </section>

        <Sec>
          <Chap>CHAPTER 1</Chap>
          <H>두 사람의 사주 원국</H>
          <Person role="아내" label="1988년 3월 15일 자시 (양력)" />
          <SajuChart saju={WIFE} dayLabel="일주 · 아내" />
          <div className="my-1 h-px bg-[#F8D4E1]" />
          <Person role="남편" label="1988년 6월 15일 신시 추정 (양력)" />
          <SajuChart saju={HUSBAND} dayLabel="일주 · 남편" />
          <P>
            아내는 한봄 묘월(卯月)에 태어난 <b>기토(己土)</b>, 봄 들판의 부드러운 흙이에요. 나무와 흙이 넉넉한 대신{" "}
            <b>쇠(金) 기운이 하나도 없어요.</b> 남편은 한여름 오월(午月)에 태어난 <b>신금(辛金)</b>, 반짝이는 보석이에요. 흙이
            든든하게 받쳐 주는 대신 <b>나무(木)와 물(水) 기운이 비어 있어요.</b>
          </P>
          <p className="m-0 rounded-2xl border-[1.5px] border-dashed border-[#F3B6CB] px-3.5 py-3 text-[13px] leading-[1.65] text-[#6B4A58]">
            남편분 시간은 오후 5시 추정이라 신시(申時)로 봤어요. 5시 30분이 넘었다면 유시(酉時)가 되는데, 그때도 두 사람의 배우자
            자리가 쇠 기운으로 이어지는 큰 흐름은 같아요.
          </p>
        </Sec>

        <Sec>
          <Chap>CHAPTER 2</Chap>
          <H>
            오행으로 보는 우리
            <br />
            “내게 없는 걸 당신이 가졌어요”
          </H>
          <Fill who="아내" missing="金 쇠" from="남편" chars="辛 · 申" />
          <Fill who="남편" missing="木 나무 · 水 물" from="아내" chars="甲 乙 卯 · 子" />
          <P>
            사주에서 비어 있는 기운을 상대가 가지고 있으면, 함께 있을 때 이유 없이 마음이 편하고 든든하게 느껴지기 쉬워요. 두 분은
            한쪽만 채워 주는 게 아니라 <b>서로가 서로의 빈칸을 정확히 채우는</b> 드문 조합이에요.
          </P>
          <P>
            특히 남편에게 나무 기운은 아내를 뜻하는 별인 <b>재성(財星)</b>이에요. 남편 사주에는 재성이 하나도 없는데, 아내 사주는 나무
            기운으로 가득해요. 남편에게 아내는 내 사주에 없던 인연의 별을 채워 주는 사람이에요.
          </P>
        </Sec>

        <Sec>
          <Chap>CHAPTER 3</Chap>
          <H>
            두 사람의 마음 궁합
            <br />
            “흙이 보석을 키워요”
          </H>
          <P>
            흙은 그 안에서 보석을 길러 내요. 명리학에서는 이를 <b>토생금(土生金)</b>이라고 해요. 아내의 기토가 남편의 신금을 낳고
            키워 주는 흐름이라, 두 분 사이에는 자연스럽게 아내가 품어 주고 남편이 그 안에서 빛나는 모습이 생기기 쉬워요.
          </P>
          <Li>
            아내에게 남편은 <b>식신(食神)</b>이에요. 긴장되는 이성이라기보다 맛있는 걸 먹이고 챙겨 주고 싶은, 함께 있으면 말과 표현이
            편해지는 사람이에요.
          </Li>
          <Li>
            남편에게 아내는 <b>편인(偏印)</b>이에요. 말하지 않아도 나를 알아주고, 지칠 때 기댈 수 있는 쉼터 같은 사람이에요.
          </Li>
          <Li>그래서 두 분은 설렘보다 편안함이 먼저 오는, 오래 갈수록 더 친해지는 친구 같은 부부가 되기 쉬워요.</Li>
        </Sec>

        <Sec>
          <Chap>CHAPTER 4</Chap>
          <H>
            배우자 자리
            <br />
            “부부궁이 서로를 끌어당겨요”
          </H>
          <P>
            일주 아래 글자(일지)는 배우자와 집을 뜻하는 <b>부부궁</b>이에요. 아내의 사화(巳)와 남편의 축토(丑)가 만나{" "}
            <b>巳丑 금국(金局) 반합</b>을 이뤄요. 두 사람의 부부궁이 손을 잡고 만들어 내는 기운이 바로 아내에게 없던 쇠 기운이라,
            함께 사는 집 자체가 아내에게 힘이 되는 구조예요.
          </P>
          <Li>
            아내의 시지 자수(子)와 남편의 일지 축토(丑)는 <b>子丑 육합</b>이에요. 하루를 마무리하는 시간에 서로에게 기대는 사이예요.
          </Li>
          <Li>
            아내의 子와 남편의 申·辰이 모이면 <b>申子辰 수국(水局)</b>이 완성돼요. 남편에게 없던 물 기운이 둘 사이에서 크게
            만들어져요.
          </Li>
          <Li>
            남편의 시지 신금(申)은 아내의 일지 巳와 <b>巳申 육합</b>을 이뤄요. 다만 남편분 시간이 추정이라 이 부분은 가볍게 봐 주세요.
          </Li>
        </Sec>

        <Sec>
          <Chap>CHAPTER 5</Chap>
          <H>잘 맞는 점</H>
          <Point tone="good" title="서로의 빈칸을 채우는 오행">
            아내에게 없는 쇠는 남편이, 남편에게 없는 나무와 물은 아내가 가졌어요. 함께 있을 때 두 사람 모두 균형이 맞아져요.
          </Point>
          <Point tone="good" title="집이 제일 편한 부부">
            부부궁끼리 합을 이뤄서, 밖에서보다 둘이 있는 집에서 더 편안하고 다정해지기 쉬워요.
          </Point>
          <Point tone="good" title="같은 해에 태어난 친구 같은 사이">
            두 분 모두 무진년(戊辰年) 용띠예요. 같은 시절을 지나 온 만큼 말이 잘 통하고, 사는 방식에 대한 생각도 비슷한 편이에요.
          </Point>
        </Sec>

        <Sec>
          <Chap>CHAPTER 6</Chap>
          <H>살짝 조심할 점</H>
          <Point tone="care" title="챙김이 간섭으로 들릴 수 있어요">
            두 분 사주를 합치면 흙 기운이 일곱 개나 돼요. 흙이 너무 두터우면 보석이 묻히기도 해요(土多金埋). 아내의 걱정과 챙김이
            남편에게는 답답함으로 느껴질 수 있으니, 남편이 혼자 정리하는 시간도 존중해 주세요.
          </Point>
          <Point tone="care" title="밤늦은 진지한 대화는 피해요">
            아내의 子(한밤의 물)와 남편의 午(한여름의 불)가 부딪히는 <b>子午충</b>이 있어요. 피곤한 밤에 시작한 이야기가 다툼으로
            번지기 쉬우니, 중요한 이야기는 낮이나 주말 오전에 해 보세요.
          </Point>
          <Point tone="care" title="짧고 정확한 말이 차갑게 들릴 때">
            남편의 신금이 아내의 월간 을목(乙)을 치는 <b>乙辛충</b>이 있어요. 남편의 똑 부러지는 한마디가 아내 마음엔 날카롭게 꽂힐
            수 있어요. 남편은 결론 앞에 “고마워”, “당신 말도 맞아” 한마디를 먼저 붙여 주세요.
          </Point>
        </Sec>

        <Sec>
          <Chap>CHAPTER 7</Chap>
          <H>더 가까워지는 팁</H>
          <Point tone="tip" title="집에 초록과 물을 들여요">
            남편에게 필요한 나무와 물 기운이에요. 초록 식물이나 작은 어항을 두고, 강가나 호숫가 산책을 함께 해 보세요.
          </Point>
          <Point tone="tip" title="흰색·은색 소품은 아내 곁에">
            아내에게 없는 쇠 기운이에요. 커플 반지나 은색 소품처럼 남편이 건네는 작은 선물이 아내에게 힘이 돼요.
          </Point>
          <Point tone="tip" title="칭찬은 구체적으로, 대화는 해 있을 때">
            “고마워”보다 “오늘 저녁 차려 줘서 고마워”처럼 구체적인 말이 두 분 사이를 더 따뜻하게 만들어요.
          </Point>
        </Sec>

        <Sec className="bg-[#FFF7D6]">
          <Chap className="text-[#8A5A00]">콩닥 한마디</Chap>
          <H className="text-[#5C3D00]">
            서로의 빈칸을
            <br />
            가장 잘 아는 두 사람이에요
          </H>
          <div className="grid grid-cols-3 gap-2">
            <Lucky
              label="우리의 색"
              value="연두 · 흰색"
              swatch={
                <div className="flex">
                  <div className="size-6 rounded-full bg-[#8CCB5E]" />
                  <div className="-ml-2 size-6 rounded-full border border-[#E5DDE0] bg-white" />
                </div>
              }
            />
            <Lucky label="우리의 장소" value="물가 산책길" swatch={<div className="size-6 rounded-full bg-[#4D94E0]" />} />
            <Lucky label="우리의 시간" value="저녁 6시" swatch={<div className="size-6 rounded-full bg-[#ADB5BD]" />} />
          </div>
          <P className="text-[#6B4A2B]">
            해 질 무렵 물가를 함께 걸어 보세요. 남편에게는 나무와 물 기운이, 아내에게는 저녁의 쇠 기운이 더해지는 시간이에요.
          </P>
        </Sec>

        <Disclaimer>이 풀이는 명리학을 바탕으로 한 재미용 콘텐츠예요.</Disclaimer>

        <Link
          href="/compat"
          className="flex h-[58px] items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
        >
          우리 궁합 보러 가기
        </Link>
      </main>
    </PhoneFrame>
  );
}
