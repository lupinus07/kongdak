"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * 임시 로그인 상태. 아직 Supabase Auth(카카오)가 연결되지 않아서
 * 브라우저 localStorage에 "로그인한 척"하는 값만 둔다. 화면 확인용이다.
 * TODO: Supabase Auth 세션(getUser / onAuthStateChange)으로 교체하고 이 파일은 지운다.
 */

export type Session = { nickname: string };

const KEY = "kongdak:dev-session";
const EVENT = "kongdak:session-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

export function devLogin() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ nickname: "콩닥이" } satisfies Session));
  } catch {
    // 저장소를 못 쓰면 로그인 상태를 유지할 수 없다
  }
  emit();
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
  emit();
}

/** ready: 브라우저에서 저장값을 읽은 뒤부터 true (서버 렌더·하이드레이션 중에는 false) */
export function useSession(): { session: Session | null; ready: boolean } {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const session = useMemo<Session | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }, [raw]);
  return { session, ready };
}
