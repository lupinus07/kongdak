import type { Product } from "./products";

/** 비회원이 결제한 풀이의 결과 링크를 이 브라우저에 기억해 둔다. 같은 브라우저에서는 '내 기록'에서 다시 열 수 있다. */

const KEY = "kongdak:my-readings";

export type SavedReading = { token: string; product: Product; orderCode?: string; savedAt: number };

export function loadMyReadings(): SavedReading[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveMyReading(r: Omit<SavedReading, "savedAt">) {
  try {
    const rest = loadMyReadings().filter((x) => x.token !== r.token);
    localStorage.setItem(KEY, JSON.stringify([{ ...r, savedAt: Date.now() }, ...rest].slice(0, 30)));
  } catch {
    // 저장소를 못 쓰는 환경(시크릿 모드 등)에서는 건너뛴다
  }
}
