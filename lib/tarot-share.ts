import { TAROT_CARD_COUNT, TAROT_TOPICS, type TarotTopicId } from "./tarot";
import type { DailyDraw } from "./tarot-daily";

/**
 * 친구 공유 링크: /tarot/share/{카드}-{고민}-{u|r}  예) /tarot/share/54-some-u
 * 링크에 카드·고민·정역이 다 들어 있어서 DB에 따로 저장하지 않는다. 사용자가 적은 고민 글은 넣지 않는다.
 */
export function shareCode({ card, topic, reversed }: DailyDraw) {
  return `${card}-${topic}-${reversed ? "r" : "u"}`;
}

export function parseShareCode(code: string): DailyDraw | null {
  const m = /^(\d{1,2})-([a-z_]+)-([ur])$/.exec(code);
  if (!m) return null;
  const card = Number(m[1]);
  const topic = TAROT_TOPICS.find((t) => t.id === m[2])?.id as TarotTopicId | undefined;
  if (card >= TAROT_CARD_COUNT || !topic) return null;
  return { card, topic, reversed: m[3] === "r" };
}

export function sharePath(draw: DailyDraw) {
  return `/tarot/share/${shareCode(draw)}`;
}
