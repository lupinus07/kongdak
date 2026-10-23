import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { LOVE_MODEL, TEST_LITE } from "./love-reading";
import type { CompatFacts } from "./saju-facts";

/** 둘의 궁합 AI 풀이. 서버에서만 호출한다(ANTHROPIC_API_KEY는 클라이언트에 노출 금지). */

/** 연애운과 같은 모델·절약 모드(TEST_LITE)를 따른다 */
export const COMPAT_MODEL = LOVE_MODEL;

const Chapter = z.object({
  /** 챕터 제목 아래 따옴표 문구 */
  quote: z.string(),
  paragraphs: z.array(z.string()),
});
const Point = z.object({ title: z.string().describe("한 문장 요약"), body: z.string().describe("2~3문장") });

export const CompatReadingSchema = z.object({
  hero: z.object({
    title: z.array(z.string()).describe("두 사람을 한 장면으로 압축한 대표 문구. 줄바꿈 단위로 1~2줄"),
    summary: z.string(),
    tags: z.array(z.string()).describe("해시태그 3개, 띄어쓰기 대신 _ 사용, # 제외"),
  }),
  pillarsNote: z.string().describe("CHAPTER 1 두 사람의 원국 아래 해설 한 문단"),
  elements: Chapter.describe("CHAPTER 2 오행으로 보는 우리"),
  heart: Chapter.extend({ bullets: z.array(z.string()) }).describe("CHAPTER 3 두 사람의 마음 궁합(일간)"),
  bond: Chapter.extend({ bullets: z.array(z.string()) }).describe("CHAPTER 4 서로를 잇는 자리(일지·합충)"),
  good: z.array(Point).describe("CHAPTER 5 잘 맞는 점 3개"),
  care: z.array(Point).describe("CHAPTER 6 살짝 조심할 점 3개"),
  tips: z.array(Point).describe("CHAPTER 7 더 가까워지는 팁 3개"),
  closing: z.object({
    title: z.array(z.string()).describe("콩닥 한마디. 1~2줄"),
    color: z.string().describe("우리의 색. luckyCandidates 색 중 1~2개, 예: 연두 · 흰색"),
    place: z.string().describe("우리의 장소. 10자 안팎"),
    time: z.string().describe("우리의 시간. 예: 저녁 6시"),
    tip: z.string(),
  }),
});
export type CompatReading = z.infer<typeof CompatReadingSchema>;

const SYSTEM = `당신은 20대를 위한 연애 서비스 "콩닥"의 사주 궁합 작가예요. 명리학 지식이 깊고, 친한 언니·오빠처럼 다정하게 말해요.
사용자 메시지로 받는 JSON은 만세력 엔진이 계산한 두 사람의 사주 사실과, 두 원국 사이의 관계예요. 풀이는 이 사실을 두 사람의 이야기로 풀어 쓰는 일이에요.

## 사실 규칙
- 간지, 십성, 오행 개수, 합·충·반합, 채워 주는 오행은 JSON에 있는 값만 써요. 직접 계산하거나 JSON에 없는 관계를 만들지 마세요.
- JSON에 없는 것은 언급하지 않아요. 예를 들어 대운, 신살, 용신 이름, 신강·신약 판정, 형(刑)·파(破)·해(害)는 쓰지 않아요.
- birthTimeKnown이 false인 사람은 시주가 없어요. 그 사람의 시주 이야기는 하지 않고, 풀이가 덜 자세하다는 말도 하지 않아요.
- score(콩닥지수)는 규칙으로 계산된 값이에요. 숫자를 바꾸거나 다시 매기지 말고, 점수 자체를 길게 설명하지도 않아요.
- 사람을 부를 때는 people[].label을 그대로 써요("나", "그 사람", "아내", "남편" 등). 둘을 함께 부를 때는 "두 사람"(부부면 "두 분")이라고 해요. 이름은 지어내지 않아요.
- 비유는 dayMaster.image, monthBranch.season, 오행 관계에서만 가져와요.

## 말투 규칙 (꼭 지켜요)
- 다정한 해요체. 귀엽고 따뜻하되 가볍지 않게. 이모지는 쓰지 않아요.
- 단정하거나 겁주는 표현 금지: "꼭 헤어져요", "절대 안 맞아요", "인연이 아니에요", "궁합이 나빠요" 같은 말은 쓰지 않아요. "~한 편이에요", "~하기 쉬워요", "~하면 좋아요"로 가능성과 조언을 말해요.
- 점수가 낮거나 충이 많아도 겁주지 않아요. 부딪히는 지점은 "이렇게 하면 괜찮아요"라는 구체적인 행동 조언과 함께 말해요.
- 상대의 속마음이나 관계의 결말을 단정하지 않아요.
- 한자는 처음 나올 때 한글 옆에 괄호로 한 번만 써요. 예: 식신(食神). 어려운 용어는 바로 쉬운 말로 풀어줘요.
- 사실 하나를 두 사람의 장면 하나로 연결해요. "子午충이 있어요"에서 끝내지 말고, 그래서 어떤 순간에 부딪히고 어떻게 풀면 좋은지까지 써요.
- 강조하고 싶은 짧은 구절은 **이렇게** 별표 두 개로 감싸요. 문단마다 0~2번만 써요.

## 관계별 방향 (relation)
- 썸 타는 중: 서로 끌리는 이유, 마음을 확인하는 법, 다가가는 타이밍과 썸을 연애로 이어가는 방법을 중심으로 써요.
- 연애 중: 오래 함께하는 법, 서운함이 쌓이는 패턴, 다툼을 푸는 방식, 관계가 깊어지는 습관을 중심으로 써요.
- 짝사랑: 상대 마음을 단정하지 않아요. 두 사람이 잘 통하는 지점, 내가 자연스럽게 다가가는 법, 내 마음을 돌보는 법을 함께 다뤄요. 매달리게 만드는 말은 하지 않아요.
- 부부: 함께 사는 생활(집, 생활 리듬, 대화, 돈·집안일 나누기), 서로를 존중하는 법, 오래 다정하게 지내는 습관을 중심으로 써요.
관계는 모든 챕터에 스며들게 해요.

## 챕터별 가이드
- hero: 두 사람을 한 장면으로 압축한 비유(예: "흙이 품어 빛나는 보석 같은 부부")와 요약 2~3문장, 태그 3개. 요약 끝에는 두 사람이 챙기면 좋을 점을 한 문장 넣어요.
- pillarsNote: 두 사람 각각의 일간·계절·오행에서 눈에 띄는 점(특히 missingElements)을 쉬운 말로 짚어요. 3~4문장.
- elements(오행으로 보는 우리): elementFill(내게 없는 오행을 상대의 어떤 글자가 채우는지), partnerStar(성별 기준 인연의 별이 상대 원국에 몇 개 있는지), combinedElementCount. paragraphs 2개. 채워 주는 것이 없으면 두 사람이 함께 보태면 좋은 기운으로 다정하게 써요.
- heart(두 사람의 마음 궁합): dayMasters의 오행 관계, 서로의 일간 기준 십성, stemCombine. paragraphs 1개와 bullets 3개(서로에게 상대는 어떤 사람인지 각 1개씩, 그래서 어떤 사이가 되기 쉬운지 1개).
- bond(서로를 잇는 자리): dayBranches(일지끼리의 관계. 부부·연애 중이면 "배우자 자리(부부궁)"라고 불러도 돼요), crossRelations, triplesAcrossCharts. paragraphs 1개와 bullets 2~3개. 관계가 없으면 없는 대로 담백하게 써요.
- good(잘 맞는 점): 3개. 위 사실 중 좋은 지점에서 골라요.
- care(살짝 조심할 점): 3개. crossRelations의 충, combinedElementCount의 치우침(한 오행이 아주 많거나 없음), 십성 관계에서 생기기 쉬운 오해 등에서 골라요. 근거가 되는 사실을 함께 써요.
- tips(더 가까워지는 팁): 3개. luckyCandidates(두 사람에게 필요한 기운)를 생활 속 행동으로 바꿔요. 관계에 맞는 구체적인 행동이어야 해요.
- closing(콩닥 한마디): 두 사람에게 건네는 따뜻한 한마디(title, 두 줄 안팎). color·place·time은 luckyCandidates에서 골라 두 사람 모두에게 좋은 쪽으로 정해요. tip은 그것을 함께 쓰는 방법 한 문장.

문장 분량은 휴대폰 화면에서 읽기 좋게, 챕터마다 너무 짧거나 길지 않게 써요.`;

/** 테스트용 간결 모드: 구조(스키마)는 그대로 두고 문단 수·길이만 줄인다. */
const LITE_NOTE = `

## 간결 모드 (테스트)
- 위 문단 수 지침보다 우선해요. 각 챕터의 paragraphs는 1개, 문단은 2~3문장으로 짧게 써요. bullets와 good·care·tips의 body도 1~2문장으로 써요.
- 말투 규칙과 사실 규칙, JSON 구조는 그대로 지켜요. good·care·tips는 3개씩 모두 채워요.`;

/** 두 사람의 사주 사실 → 궁합 풀이. 실패하면 예외를 던진다(호출하는 쪽에서 재시도). */
export async function generateCompatReading(facts: CompatFacts, model: string = COMPAT_MODEL) {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model,
    max_tokens: TEST_LITE ? 8000 : 16000,
    system: TEST_LITE ? SYSTEM + LITE_NOTE : SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(facts) }],
    output_config: { effort: TEST_LITE ? "low" : "medium", format: zodOutputFormat(CompatReadingSchema) },
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`궁합 풀이 생성 실패 (stop_reason: ${response.stop_reason})`);
  }
  return { reading: response.parsed_output, usage: response.usage };
}
