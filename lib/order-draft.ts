import { checkBirthDate } from "./birth";
import type { Product } from "./products";

/** 로그인·결제를 거쳐 돌아와도 입력이 이어지도록 브라우저에 잠깐 보관하는 입력값 */

type Person = { birth: string; time: string; gender: string };

export type CompatDraft = { product: "compat"; relation: string; me: Person; you: Person };
export type LoveDraft = {
  product: "love";
  situation: string;
  calendar: string;
  birth: string;
  time: string;
  gender: string;
};
export type OrderDraft = CompatDraft | LoveDraft;

/** 결제 전에 생년월일이 모두 제대로 입력됐는지 본다. 풀이 계산에 꼭 필요하다. */
export function isDraftReady(d: OrderDraft): boolean {
  const births = d.product === "compat" ? [d.me.birth, d.you.birth] : [d.birth];
  return births.every((b) => checkBirthDate(b) === "ok");
}

const KEY = "kongdak:order-draft";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function saveOrderDraft(draft: OrderDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ draft, savedAt: Date.now() }));
  } catch {
    // 저장소를 못 쓰는 환경(시크릿 모드 등)에서는 건너뛴다
  }
}

export function loadOrderDraft(product?: Product): OrderDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { draft, savedAt } = JSON.parse(raw) as { draft: OrderDraft; savedAt: number };
    if (Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return !product || draft.product === product ? draft : null;
  } catch {
    return null;
  }
}

export function clearOrderDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}
