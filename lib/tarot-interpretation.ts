import type { TarotTopicId } from "./tarot";

export type TarotInterpretation = {
  headline: string;
  keywords: string[];
  meaning: string;
  topicReading: string;
  advice: string;
};

/**
 * 카드 × 정/역 × 고민 카테고리 풀이 조회.
 * 풀이 780개를 tarot_interpretations 테이블에 넣은 뒤 이 함수를 DB 조회로 바꾼다.
 * 지금은 화면 확인용 임시 문구를 돌려준다.
 */
export function getInterpretation(
  _card: number,
  _reversed: boolean,
  _topic: TarotTopicId,
): TarotInterpretation {
  return {
    headline: "카드가 건네는\n이야기를 준비 중이에요",
    keywords: ["사랑", "마음", "흐름"],
    meaning: "[카드 정/역방향의 기본 의미 — 2문장]",
    topicReading: "[카테고리별 풀이 — 2~3문장]",
    advice: "[오늘 해볼 수 있는 작은 행동 조언 — 1~2문장]",
  };
}
