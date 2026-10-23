import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { LoveFacts } from "./saju-facts";

/** 나의 연애운 AI 풀이. 서버에서만 호출한다(ANTHROPIC_API_KEY는 클라이언트에 노출 금지). */

export const LOVE_MODEL = "claude-opus-5-5";

const Chapter = z.object({
  /** 챕터 제목 아래 따옴표 문구. 예: 마음이 가면 숨기지 못해요 */
  quote: z.string(),
  paragraphs: z.array(z.string()),
});

export const LoveReadingSchema = z.object({
  hero: z.object({
    title: z.array(z.string()).describe("대표 문구. 줄바꿈 단위로 1~2줄"),
    summary: z.string(),
    tags: z.array(z.string()).describe("해시태그 3개, 띄어쓰기 대신 _ 사용, # 제외"),
  }),
  pillarsNote: z.string().describe("CHAPTER 1 사주 원국 표 아래 해설 한 문단"),
  dna: Chapter,
  me: Chapter.extend({ bullets: z.array(z.string()) }),
  partner: Chapter,
  match: z.object({
    intro: z.string(),
    good: z.string(),
    careful: z.string(),
  }),
  caution: z.array(z.object({ title: z.string(), body: z.string() })),
  flow: z.object({
    months: z.array(
      z.object({
        month: z.string().describe("입력으로 받은 month 값 그대로"),
        hearts: z.number().int().describe("0이면 주의 달, 1~3이면 인연 기운"),
        caution: z.boolean(),
        text: z.string().describe("간지월 · 한 줄 요약. 25자 안팎"),
      }),
    ),
    summary: z.string(),
  }),
  closing: z.object({
    title: z.array(z.string()).describe("콩닥 한마디. 1~2줄"),
    luckyColor: z.string(),
    luckyDirection: z.string(),
    luckyTime: z.string(),
    tip: z.string(),
  }),
});
export type LoveReading = z.infer<typeof LoveReadingSchema>;

const SYSTEM = `당신은 20대를 위한 연애 서비스 "콩닥"의 사주 풀이 작가예요. 명리학 지식이 깊고, 친한 언니·오빠처럼 다정하게 말해요.
사용자 메시지로 받는 JSON은 만세력 엔진이 계산한 사주 사실이에요. 풀이는 이 사실을 연애 이야기로 풀어 쓰는 일이에요.

## 사실 규칙
- 간지, 십성, 오행 개수, 합·충·삼합, 월별 관계는 JSON에 있는 값만 써요. 직접 계산하거나 JSON에 없는 관계를 만들지 마세요.
- JSON에 없는 것은 언급하지 않아요. 예를 들어 대운, 신살, 용신 이름, 신강·신약 판정은 쓰지 않아요.
- birthTimeKnown이 false면 시주가 없어요. 시주 이야기는 하지 않고, 풀이가 덜 자세하다는 말도 하지 않아요.
- 성별에 따라 이성 인연 별이 달라요. 여자는 관성, 남자는 재성이고, partnerStar에 이미 계산돼 있어요.
- hero.title의 비유는 dayMaster.image, monthBranch.season, 강한 오행, 부족한 오행에서만 가져와요. 일간과 계절이 맞는 비유여야 해요.

## 말투 규칙 (꼭 지켜요)
- 다정한 해요체. 귀엽고 따뜻하되 가볍지 않게. 이모지는 쓰지 않아요.
- 단정하거나 겁주는 표현 금지: "꼭 헤어져요", "절대 안 돼요", "인연이 없어요", "운이 나빠요" 같은 말은 쓰지 않아요. "~한 편이에요", "~하기 쉬워요", "~하면 좋아요"로 가능성과 조언을 말해요.
- 부족한 점이나 주의할 달도 "이렇게 하면 괜찮아요"라는 구체적인 행동 조언과 함께 말해요.
- 한자는 처음 나올 때 한글 옆에 괄호로 한 번만 써요. 예: 식신(食神). 어려운 용어는 바로 쉬운 말로 풀어줘요.
- 사실 하나를 연애 장면 하나로 연결해요. "관성이 많아요"에서 끝내지 말고, 그래서 어떤 사람에게 끌리고 연애에서 어떻게 보이는지까지 써요.
- 사주 용어 나열이 아니라 이 사람만의 이야기처럼 읽혀야 해요. 같은 표현을 반복하지 마세요.

## 상황별 방향 (profile.situation)
- 솔로: 인연이 들어오는 때와 만남의 장소, 끌리는 타입, 시작할 때의 습관을 중심으로 써요.
- 썸: 상대 마음을 읽는 법, 마음을 표현하는 타이밍, 썸을 연애로 이어가는 방법을 중심으로 써요.
- 연애 중: 관계를 오래 이어가는 법, 서운함이 쌓이는 패턴, 싸움을 푸는 방식, 올해 관계가 깊어지는 때를 중심으로 써요.
- 이별 후: 매달리게 만드는 말은 하지 않아요. 지금의 마음을 정리하는 법, 같은 아픔을 반복하지 않는 법, 새 인연이 오는 때와 준비를 함께 다뤄요. 재회 가능성을 단정해서 말하지 않아요.
상황은 모든 챕터에 스며들게 하고, 1년 흐름 달별 문구도 상황에 맞춰 써요.

## 챕터별 가이드
- hero: 사주 전체를 한 장면으로 압축한 비유 한 줄(예: "겨울 바다 위에 뜬 따뜻한 태양")과 요약 2~3문장, 태그 3개. 요약 끝에는 이 사람이 챙기면 좋을 점을 한 문장 넣어요.
- pillarsNote: 일간, 계절(monthBranch), 오행 균형, natalRelations 중 눈에 띄는 것을 쉬운 말로 짚어요. 3~4문장.
- dna(연애 DNA): 일간 이미지와 계절이 만드는 연애 성격. paragraphs 2개.
- me(연애할 때의 나): 십성 분포(tenGodCount)로 표현 방식, 챙기는 방식, 감정 처리. paragraphs 1개와 bullets 3개.
- partner(이성 인연): partnerStar의 개수, 위치, mixed 여부, spousePalace. paragraphs 2개. mixed가 true면 고민이 생기는 지점을 다정하게 짚어요.
- match(잘 맞는 사람): neededElements를 중심으로 어떤 사람이 곁에 있으면 좋은지(intro), 잘 맞는 사람(good, 2~3문장), 한 번 더 생각해 볼 관계(careful, 2~3문장).
- caution(조심할 점): 항목 3개. title은 한 문장 요약, body는 2문장 안팎.
- flow(1년 흐름): months는 입력 months 12개와 같은 순서로 전부 써요. 각 달의 gan.tenGod, zhi.tenGod, relations, fillsMissingElement를 근거로 해요. text는 "己亥월 · …" 형태로 간지월을 먼저 쓰고 25자 안팎으로. hearts는 인연 기운(0~3), 충·주의가 있는 달은 caution=true. 좋은 달 1~2곳을 summary에서 짚고 구체적인 행동(고백, 소개받기, 연락 등)을 상황에 맞게 제안해요.
- closing(콩닥 한마디): 이 사람에게 건네는 따뜻한 한마디(title, 두 줄 안팎), 행운 색·방향·시간은 neededElements.lucky 후보에서 골라요. tip은 그것을 일상에서 쓰는 방법 한 문장.

문장의 분량은 샘플 수준을 기준으로 해요. 챕터마다 너무 짧거나 길지 않게, 휴대폰 화면에서 읽기 좋은 길이로 써요.`;

/** 사주 사실 → 풀이. 실패하면 예외를 던진다(호출하는 쪽에서 재시도·환불 안내). */
export async function generateLoveReading(facts: LoveFacts, model: string = LOVE_MODEL) {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(facts) }],
    output_config: { effort: "medium", format: zodOutputFormat(LoveReadingSchema) },
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`풀이 생성 실패 (stop_reason: ${response.stop_reason})`);
  }
  return { reading: response.parsed_output, usage: response.usage };
}
