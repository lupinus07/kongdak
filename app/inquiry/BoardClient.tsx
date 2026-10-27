"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPrompt } from "@/components/LoginPrompt";
import { fetchInquiryPage } from "@/lib/inquiry-board";
import type { InquiryListItem } from "@/lib/inquiry-shared";
import { useSession } from "@/lib/session";
import { TabLink } from "./TabLink";

const date = (iso: string) => iso.slice(2, 10).replaceAll("-", ".");

function Lock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B88A9C" strokeWidth="2.2" strokeLinecap="round" aria-label="비밀글">
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Row({ q }: { q: InquiryListItem }) {
  return (
    <li>
      <Link href={`/inquiry/${q.code}`} className="flex items-center gap-2.5 px-1 py-3.5 text-ink no-underline">
        <Lock />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate text-[15px]">{q.category} 문의예요</span>
          {q.mine && <span className="shrink-0 rounded-md bg-[#FFE3EC] px-1.5 py-px text-[12px] text-brand">내 글</span>}
        </span>
        <span
          className={`shrink-0 rounded-lg px-2 py-0.5 text-[12.5px] ${
            q.answered ? "bg-[#E3F4E1] text-[#2B6B2A]" : "bg-[#F3EEF0] text-ink-sub"
          }`}
        >
          {q.answered ? "답변 완료" : "답변 대기"}
        </span>
        <span className="w-[58px] shrink-0 text-right text-[12.5px] text-ink-sub">{date(q.createdAt)}</span>
      </Link>
    </li>
  );
}

type Loaded = { key: string; items: InquiryListItem[]; hasNext: boolean } | { key: string; error: true };

/** 문의 게시판 목록. 브라우저에서 Supabase에 바로 물어본다(lib/inquiry-board.ts). */
export function BoardClient() {
  const sp = useSearchParams();
  const mineOnly = sp.get("tab") === "mine";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const { session, ready } = useSession();
  const key = `${mineOnly}-${page}-${session ? "in" : "out"}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    // 로그인 상태를 알아야 '내 글' 표시와 내 문의가 맞게 나온다
    if (!ready || (mineOnly && !session)) return;
    let alive = true;
    fetchInquiryPage(page, mineOnly).then((r) => alive && setLoaded(r ? { key, ...r } : { key, error: true }));
    return () => {
      alive = false;
    };
  }, [ready, session, mineOnly, page, key]);

  const href = (p: number) => `/inquiry?${new URLSearchParams({ ...(mineOnly ? { tab: "mine" } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  const current = loaded?.key === key ? loaded : null;

  let body: React.ReactNode;
  if (mineOnly && ready && !session) {
    body = (
      <LoginPrompt
        title="로그인하고 내 문의 보기"
        desc={
          <>
            로그인한 채로 남긴 문의는
            <br />
            비밀번호 없이 바로 볼 수 있어요
          </>
        }
      />
    );
  } else if (!current) {
    body = <p className="m-0 rounded-[22px] bg-white py-10 text-center text-[14.5px] text-ink-sub">불러오는 중…</p>;
  } else if ("error" in current) {
    body = <p className="m-0 rounded-[22px] bg-white py-10 text-center text-[14.5px] text-ink-sub">목록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>;
  } else if (current.items.length === 0) {
    body = (
      <p className="m-0 rounded-[22px] bg-white py-10 text-center text-[14.5px] text-ink-sub">
        {mineOnly ? "아직 남긴 문의가 없어요." : page > 1 ? "더 이상 문의가 없어요." : "아직 문의가 없어요."}
      </p>
    );
  } else {
    body = (
      <ul className="m-0 list-none divide-y divide-[#F8E1EA] rounded-[22px] bg-white px-3 py-1">
        {current.items.map((q) => (
          <Row key={q.code} q={q} />
        ))}
      </ul>
    );
  }

  const hasNext = !!current && !("error" in current) && current.hasNext;

  return (
    <>
      <nav className="flex gap-1 rounded-[18px] bg-[#F8E1EA] p-1" aria-label="문의 보기">
        <TabLink href="/inquiry" on={!mineOnly}>
          전체 문의
        </TabLink>
        <TabLink href="/inquiry?tab=mine" on={mineOnly}>
          내 문의
        </TabLink>
      </nav>
      {body}
      {(page > 1 || hasNext) && (
        <div className="flex items-center justify-center gap-4 text-[14px]">
          {page > 1 ? (
            <Link href={href(page - 1)} className="text-brand no-underline">
              ‹ 이전
            </Link>
          ) : (
            <span className="text-ink-mute">‹ 이전</span>
          )}
          <span className="text-ink-sub">{page}쪽</span>
          {hasNext ? (
            <Link href={href(page + 1)} className="text-brand no-underline">
              다음 ›
            </Link>
          ) : (
            <span className="text-ink-mute">다음 ›</span>
          )}
        </div>
      )}
    </>
  );
}
