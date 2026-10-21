/** 타로 풀이 원본 데이터. scripts/build-tarot-seed.ts가 이 데이터로 design/tarot_seed.sql을 만든다. */

export type TopicCode = "crush" | "their_heart" | "some" | "breakup" | "confess";

/** [제목(headline), 카테고리별 풀이 2~3문장(message), 콩닥 한마디 1~2문장(advice)] */
export type Reading = [headline: string, message: string, advice: string];

export type CardData = {
  id: number;
  /** [정방향 키워드, 역방향 키워드] */
  kw: [string[], string[]];
  /** [정방향 기본 의미, 역방향 기본 의미] */
  m: [string, string];
  /** 고민별 [정방향, 역방향] 풀이 */
  t: Record<TopicCode, [Reading, Reading]>;
};
