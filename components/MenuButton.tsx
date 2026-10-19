"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoginPrompt } from "@/components/LoginPrompt";
import { logout, useSession } from "@/lib/session";

const line = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#C2255C",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function MenuItem({ href, label, onClick, children }: { href: string; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex h-14 items-center gap-3 rounded-2xl bg-bg px-4 text-base text-ink no-underline"
    >
      {children}
      <span className="flex-1">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C7A88" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

/** 홈 상단 햄버거 버튼과 오른쪽에서 나오는 메뉴 */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  const { session, ready } = useSession();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-full bg-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 mx-auto max-w-[390px]">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={close}
            className="absolute inset-0 animate-[fade-in_0.2s_ease] bg-[rgba(60,25,40,0.48)]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
            className="absolute right-0 top-0 flex h-full w-[300px] animate-[slide-in_0.25s_ease] flex-col gap-4 rounded-l-[28px] bg-white px-5 pb-6 pt-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-title text-[22px] text-brand">콩닥</span>
              <button
                type="button"
                aria-label="닫기"
                onClick={close}
                className="flex size-10 items-center justify-center rounded-full bg-bg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {!ready ? null : session ? (
              <>
                <div className="flex items-center gap-3 rounded-3xl bg-bg px-4 py-4">
                  <div className="flex size-11 items-center justify-center rounded-full bg-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FF6B9A" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title text-lg">{session.nickname} 님</span>
                    <span className="text-xs text-ink-sub">카카오로 로그인했어요</span>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  <MenuItem href="/my?tab=orders" label="결제 내역" onClick={close}>
                    <svg {...line}>
                      <rect x="3" y="6" width="18" height="13" rx="3" />
                      <path d="M3 10h18M7 15h3" />
                    </svg>
                  </MenuItem>
                  <MenuItem href="/my?tab=readings" label="내 풀이 기록" onClick={close}>
                    <svg {...line}>
                      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                    </svg>
                  </MenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      close();
                    }}
                    className="flex h-14 items-center gap-3 rounded-2xl px-4 text-left text-base text-ink-sub"
                  >
                    <svg {...line} stroke="#9C7A88">
                      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
                    </svg>
                    로그아웃
                  </button>
                </nav>

              </>
            ) : (
              <LoginPrompt />
            )}
          </aside>
        </div>
      )}
    </>
  );
}
