import { parseTopic, TAROT_CARD_COUNT, type TarotTopicId } from "@/lib/tarot";

const KEY = "kongdak:tarot-daily";

export type DailyDraw = { card: number; reversed: boolean; topic: TarotTopicId };

/** 날짜 경계는 한국 시간 기준이라, UTC로 비교하면 오전 9시에 바뀌는 문제를 피한다. */
function todayKST() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

/** 오늘 이미 뽑은 카드를 돌려준다. 없거나 저장소를 못 쓰면 null (브라우저에서만 호출). */
export function getTodayDraw(): DailyDraw | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v?.date !== todayKST()) return null;
    if (!Number.isInteger(v.card) || v.card < 0 || v.card >= TAROT_CARD_COUNT) return null;
    return { card: v.card, reversed: v.reversed === true, topic: parseTopic(v.topic) };
  } catch {
    return null;
  }
}

export function saveTodayDraw(draw: DailyDraw) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: todayKST(), ...draw }));
  } catch {
    // 저장소를 쓸 수 없어도(시크릿 모드 등) 풀이는 그대로 보여준다.
  }
}

export function drawResultHref({ topic, card, reversed }: DailyDraw) {
  return `/tarot/result?topic=${topic}&card=${card}&rev=${reversed ? 1 : 0}`;
}
