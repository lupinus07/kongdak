"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { canGoBackInApp } from "@/lib/nav-history";

/**
 * 스크롤해도 상단에 붙어 있는 헤더 (왼쪽 뒤로가기, 오른쪽 홈). <main> 밖(PhoneFrame 바로 아래)에 둔다.
 * 뒤로가기는 콩닥 안의 이전 페이지로 돌아가고, 이전 페이지가 없으면(링크로 바로 들어옴 등) href로 간다.
 */
export function BackHeader({
  title,
  href = "/",
  center,
}: {
  title?: string;
  href?: string;
  center?: ReactNode;
}) {
  const router = useRouter();

  function onBack(e: MouseEvent<HTMLAnchorElement>) {
    if (!canGoBackInApp()) return; // 링크의 href로 이동
    e.preventDefault();
    router.back();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-bg px-5 pb-2 pt-6">
      <Link href={href} onClick={onBack} aria-label="뒤로" className="flex size-11 items-center justify-center rounded-full bg-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </Link>
      {center ?? <span className="font-title text-lg">{title}</span>}
      <Link href="/" aria-label="홈으로" className="flex size-11 items-center justify-center rounded-full bg-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2255C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        </svg>
      </Link>
    </header>
  );
}
