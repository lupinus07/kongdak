"use client";

import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/** 누르는 즉시 탭 안에 작은 로딩 표시를 띄운다(새 목록을 서버에서 받는 동안 멈춘 것처럼 보이지 않게). */
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      aria-hidden="true"
      className="ml-1.5 inline-block size-3 animate-spin rounded-full border-2 border-brand border-t-transparent align-[-1px]"
    />
  ) : null;
}

export function TabLink({ href, on, children }: { href: string; on: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`flex-1 rounded-[14px] py-2 text-center text-[14.5px] no-underline ${on ? "bg-white font-title text-brand shadow-sm" : "text-ink-sub"}`}
    >
      {children}
      <Pending />
    </Link>
  );
}
