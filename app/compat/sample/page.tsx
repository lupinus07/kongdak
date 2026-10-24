import Link from "next/link";
import { BackHeader } from "@/components/BackHeader";
import { CompatReport } from "@/components/CompatReport";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Disclaimer } from "@/components/report";
import type { CompatReading } from "@/lib/compat-reading";
import { calcSaju } from "@/lib/saju";
import { buildCompatFacts } from "@/lib/saju-facts";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "궁합 샘플 풀이 - 사주 궁합 미리 보기",
  description:
    "콩닥 사주 궁합 풀이가 어떻게 나오는지 샘플로 먼저 확인해 보세요. 콩닥지수(궁합 점수), 오행으로 보는 우리, 잘 맞는 점, 조심할 점, 더 가까워지는 팁까지 담겨 있어요.",
  path: "/compat/sample",
});

/**
 * 고정 샘플 풀이(API 호출 없음). 결제 후 결과와 같은 CompatReport로 그린다.
 * 원국·콩닥지수는 만세력 엔진으로 계산하고, 글은 그 계산값(일간·합충·오행)을 근거로 미리 써 두었다.
 * 남편 시간은 오후 5시 추정 → 신시(申時). 17:30이 넘으면 유시(酉時)인데, 그때도 부부궁이 금국으로 이어지는 큰 흐름은 같다.
 */
const WIFE = { birth: "1988.03.15", calendar: "양력", time: "0", gender: "여자", label: "아내" };
const HUSBAND = { birth: "1988.06.15", calendar: "양력", time: "8", gender: "남자", label: "남편" };
const SCORE = buildCompatFacts(WIFE, HUSBAND, "부부").score;

const SAMPLE: CompatReading = {
  hero: {
    title: ["흙이 품어 빛나는", "보석 같은 부부"],
    summary:
      "아내의 흙 기운이 남편의 보석을 품고 키워 주는 사이예요. 서로에게 없는 기운을 상대가 꼭 쥐고 있어서, 함께 있을수록 균형이 맞아지는 궁합이에요. 챙겨 주는 마음이 잔소리로 들리지 않게 말의 온도만 맞추면 더 좋아요.",
    tags: ["서로_채워주는_사이", "친구같은_부부", "동갑내기_찰떡"],
  },
  pillarsNote:
    "아내는 한봄 묘월(卯月)에 태어난 **기토(己土)**, 봄 들판의 부드러운 흙이에요. 나무와 흙이 넉넉한 대신 **쇠(金) 기운이 하나도 없어요.** 남편은 한여름 오월(午月)에 태어난 **신금(辛金)**, 반짝이는 보석이에요. 흙이 든든하게 받쳐 주는 대신 **나무(木)와 물(水) 기운이 비어 있어요.**",
  elements: {
    quote: "내게 없는 걸 당신이 가졌어요",
    paragraphs: [
      "사주에서 비어 있는 기운을 상대가 가지고 있으면, 함께 있을 때 이유 없이 마음이 편하고 든든하게 느껴지기 쉬워요. 두 분은 한쪽만 채워 주는 게 아니라 **서로가 서로의 빈칸을 정확히 채우는** 드문 조합이에요.",
      "특히 남편에게 나무 기운은 아내를 뜻하는 별인 **재성(財星)**이에요. 남편 사주에는 재성이 하나도 없는데, 아내 사주는 나무 기운으로 가득해요. 남편에게 아내는 내 사주에 없던 인연의 별을 채워 주는 사람이에요.",
    ],
  },
  heart: {
    quote: "흙이 보석을 키워요",
    paragraphs: [
      "흙은 그 안에서 보석을 길러 내요. 명리학에서는 이를 **토생금(土生金)**이라고 해요. 아내의 기토가 남편의 신금을 낳고 키워 주는 흐름이라, 두 분 사이에는 자연스럽게 아내가 품어 주고 남편이 그 안에서 빛나는 모습이 생기기 쉬워요.",
    ],
    bullets: [
      "아내에게 남편은 **식신(食神)**이에요. 긴장되는 이성이라기보다 맛있는 걸 먹이고 챙겨 주고 싶은, 함께 있으면 말과 표현이 편해지는 사람이에요.",
      "남편에게 아내는 **편인(偏印)**이에요. 말하지 않아도 나를 알아주고, 지칠 때 기댈 수 있는 쉼터 같은 사람이에요.",
      "그래서 두 분은 설렘보다 편안함이 먼저 오는, 오래 갈수록 더 친해지는 친구 같은 부부가 되기 쉬워요.",
    ],
  },
  bond: {
    quote: "부부궁이 서로를 끌어당겨요",
    paragraphs: [
      "일주 아래 글자(일지)는 배우자와 집을 뜻하는 **부부궁**이에요. 아내의 사화(巳)와 남편의 축토(丑)가 만나 **巳丑 금국(金局) 반합**을 이뤄요. 두 사람의 부부궁이 손을 잡고 만들어 내는 기운이 바로 아내에게 없던 쇠 기운이라, 함께 사는 집 자체가 아내에게 힘이 되는 구조예요.",
    ],
    bullets: [
      "아내의 시지 자수(子)와 남편의 일지 축토(丑)는 **子丑 육합**이에요. 하루를 마무리하는 시간에 서로에게 기대는 사이예요.",
      "아내의 子와 남편의 申·辰이 모이면 **申子辰 수국(水局)**이 완성돼요. 남편에게 없던 물 기운이 둘 사이에서 크게 만들어져요.",
      "남편의 시지 신금(申)은 아내의 일지 巳와 **巳申 육합**을 이뤄요. 다만 남편분 시간이 추정이라 이 부분은 가볍게 봐 주세요.",
    ],
  },
  good: [
    {
      title: "서로의 빈칸을 채우는 오행",
      body: "아내에게 없는 쇠는 남편이, 남편에게 없는 나무와 물은 아내가 가졌어요. 함께 있을 때 두 사람 모두 균형이 맞아져요.",
    },
    { title: "집이 제일 편한 부부", body: "부부궁끼리 합을 이뤄서, 밖에서보다 둘이 있는 집에서 더 편안하고 다정해지기 쉬워요." },
    {
      title: "같은 해에 태어난 친구 같은 사이",
      body: "두 분 모두 무진년(戊辰年) 용띠예요. 같은 시절을 지나 온 만큼 말이 잘 통하고, 사는 방식에 대한 생각도 비슷한 편이에요.",
    },
  ],
  care: [
    {
      title: "챙김이 간섭으로 들릴 수 있어요",
      body: "두 분 사주를 합치면 흙 기운이 일곱 개나 돼요. 흙이 너무 두터우면 보석이 묻히기도 해요(土多金埋). 아내의 걱정과 챙김이 남편에게는 답답함으로 느껴질 수 있으니, 남편이 혼자 정리하는 시간도 존중해 주세요.",
    },
    {
      title: "밤늦은 진지한 대화는 피해요",
      body: "아내의 子(한밤의 물)와 남편의 午(한여름의 불)가 부딪히는 **子午충**이 있어요. 피곤한 밤에 시작한 이야기가 다툼으로 번지기 쉬우니, 중요한 이야기는 낮이나 주말 오전에 해 보세요.",
    },
    {
      title: "짧고 정확한 말이 차갑게 들릴 때",
      body: "남편의 신금이 아내의 월간 을목(乙)을 치는 **乙辛충**이 있어요. 남편의 똑 부러지는 한마디가 아내 마음엔 날카롭게 꽂힐 수 있어요. 남편은 결론 앞에 “고마워”, “당신 말도 맞아” 한마디를 먼저 붙여 주세요.",
    },
  ],
  tips: [
    {
      title: "집에 초록과 물을 들여요",
      body: "남편에게 필요한 나무와 물 기운이에요. 초록 식물이나 작은 어항을 두고, 강가나 호숫가 산책을 함께 해 보세요.",
    },
    {
      title: "흰색·은색 소품은 아내 곁에",
      body: "아내에게 없는 쇠 기운이에요. 커플 반지나 은색 소품처럼 남편이 건네는 작은 선물이 아내에게 힘이 돼요.",
    },
    {
      title: "칭찬은 구체적으로, 대화는 해 있을 때",
      body: "“고마워”보다 “오늘 저녁 차려 줘서 고마워”처럼 구체적인 말이 두 분 사이를 더 따뜻하게 만들어요.",
    },
  ],
  closing: {
    title: ["서로의 빈칸을", "가장 잘 아는 두 사람이에요"],
    color: "연두 · 흰색",
    place: "물가 산책길",
    time: "저녁 6시",
    tip: "해 질 무렵 물가를 함께 걸어 보세요. 남편에게는 나무와 물 기운이, 아내에게는 저녁의 쇠 기운이 더해지는 시간이에요.",
  },
};

export default function CompatSamplePage() {
  return (
    <PhoneFrame>
      <BackHeader
        href="/compat"
        center={<span className="rounded-[14px] bg-badge px-3.5 py-1.5 text-[14px] text-[#5C3D00]">샘플 궁합</span>}
      />
      <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">
        <CompatReport
          me={{ label: WIFE.label, saju: calcSaju(WIFE), dateLabel: "1988년 3월 15일 자시 (양력)" }}
          you={{ label: HUSBAND.label, saju: calcSaju(HUSBAND), dateLabel: "1988년 6월 15일 신시 추정 (양력)" }}
          relation="부부"
          score={SCORE}
          reading={SAMPLE}
          chartNote={
            <p className="m-0 rounded-2xl border-[1.5px] border-dashed border-[#F3B6CB] px-3.5 py-3 text-[13px] leading-[1.65] text-[#6B4A58]">
              남편분 시간은 오후 5시 추정이라 신시(申時)로 봤어요. 5시 30분이 넘었다면 유시(酉時)가 되는데, 그때도 두 사람의 배우자
              자리가 쇠 기운으로 이어지는 큰 흐름은 같아요.
            </p>
          }
        />

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
