export const TAROT_TOPICS = [
  { id: "crush", label: "짝사랑" },
  { id: "heart", label: "그 사람 속마음" },
  { id: "some", label: "썸 진행 상황" },
  { id: "reunion", label: "이별 · 재회" },
  { id: "confess", label: "고백해도 좋은 타이밍일까?" },
] as const;

export type TarotTopicId = (typeof TAROT_TOPICS)[number]["id"];

export const TAROT_TOPIC_QUESTIONS: Record<TarotTopicId, string> = {
  crush: "그 사람도 날 좋아할까?",
  heart: "그 사람은 나를 어떻게 생각할까?",
  some: "우리 썸, 어디까지 왔을까?",
  reunion: "다시 만날 수 있을까?",
  confess: "고백해도 좋은 타이밍일까?",
};

export function parseTopic(v: string | null): TarotTopicId {
  return TAROT_TOPICS.some((t) => t.id === v) ? (v as TarotTopicId) : "crush";
}

export const TAROT_CARD_COUNT = 78;

/** 카드 번호(0~77)와 정/역방향을 무작위로 뽑는다. */
export function drawRandomCard() {
  return {
    card: Math.floor(Math.random() * TAROT_CARD_COUNT),
    reversed: Math.random() < 0.5,
  };
}
