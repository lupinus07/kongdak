import Link from "next/link";
import type { ReactNode } from "react";

/** 스크롤해도 상단에 붙어 있는 헤더 (왼쪽 뒤로가기, 오른쪽 홈). <main> 밖(PhoneFrame 바로 아래)에 둔다. */
export function BackHeader({
  title,
  href = "/",
  center,
}: {
  title?: string;
  href?: string;
  center?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-bg px-5 pb-2 pt-6">
      <Link href={href} aria-label="뒤로" className="flex size-11 items-center justify-center rounded-full bg-white">
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
