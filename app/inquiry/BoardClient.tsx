"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPrompt } from "@/components/LoginPrompt";
import { fetchInquiryPage } from "@/lib/inquiry-board";
import { createClient } from "@/lib/supabase/client";
import type { InquiryListItem } from "@/lib/inquiry-shared";
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

type PageData = { items: InquiryListItem[]; hasNext: boolean };

/** 한 번 받은 목록은 브라우저 메모리에 두고, 탭·쪽을 다시 열면 바로 보여준다(뒤에서 새로 받아 바꾼다). */
const memory = new Map<string, PageData>();

/** 게시판 화면 (목록·탭·쪽 넘김). 서버가 미리 만든 첫 화면과 브라우저 화면이 같이 쓴다. */
export function BoardView({
  mineOnly,
  page,
  data,
  status,
}: {
  mineOnly: boolean;
  page: number;
  data: PageData | null;
  /** login: 로그인 안내, loading: 0.3초 넘게 기다리는 중, error: 못 읽음 */
  status?: "login" | "loading" | "error";
}) {
  const href = (p: number) => `/inquiry?${new URLSearchParams({ ...(mineOnly ? { tab: "mine" } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  const box = "m-0 rounded-[22px] bg-white py-10 text-center text-[14.5px] text-ink-sub";

  let body: React.ReactNode;
  if (status === "login") {
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
  } else if (data && data.items.length === 0) {
    body = <p className={box}>{mineOnly ? "아직 남긴 문의가 없어요." : page > 1 ? "더 이상 문의가 없어요." : "아직 문의가 없어요."}</p>;
  } else if (data) {
    body = (
      <ul className="m-0 list-none divide-y divide-[#F8E1EA] rounded-[22px] bg-white px-3 py-1">
        {data.items.map((q) => (
          <Row key={q.code} q={q} />
        ))}
      </ul>
    );
  } else if (status === "error") {
    body = <p className={box}>목록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>;
  } else {
    // 빨리 오면 아무것도 안 보이다가 바로 목록이 뜬다. 0.3초가 넘으면 그때 안내를 보여준다.
    body = <p className={box}>{status === "loading" ? "불러오는 중…" : "\u00a0"}</p>;
  }

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
      {data && status !== "login" && (page > 1 || data.hasNext) && (
        <div className="flex items-center justify-center gap-4 text-[14px]">
          {page > 1 ? (
            <Link href={href(page - 1)} className="text-brand no-underline">
              ‹ 이전
            </Link>
          ) : (
            <span className="text-ink-mute">‹ 이전</span>
          )}
          <span className="text-ink-sub">{page}쪽</span>
          {data.hasNext ? (
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

/**
 * 문의 게시판 목록. 첫 쪽은 서버가 미리 만든 목록(initial)을 바로 보여주고, 뒤에서 브라우저가 Supabase에 직접 물어
 * 최신 목록과 '내 글' 표시로 바꾼다(lib/inquiry-board.ts). 로그인 여부는 휴대폰에 있는 정보로 확인한다(네트워크 없음).
 */
export function BoardClient({ initial }: { initial: PageData | null }) {
  const sp = useSearchParams();
  const mineOnly = sp.get("tab") === "mine";
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const key = `${mineOnly ? "mine" : "all"}-${page}`;

  const [hasSession, setHasSession] = useState<boolean | null>(null);
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setHasSession(!!data.session));
  }, []);

  const [fresh, setFresh] = useState<Record<string, PageData>>({});
  const [failed, setFailed] = useState<string | null>(null);
  const [slow, setSlow] = useState<string | null>(null);
  const data = fresh[key] ?? memory.get(key) ?? (!mineOnly && page === 1 ? initial : null);
  const needLogin = mineOnly && hasSession === false;

  useEffect(() => {
    // '내 문의'는 로그인했을 때만 읽는다. '전체 문의'는 기다리지 않고 바로 읽는다(로그인 정보는 알아서 같이 간다).
    if (mineOnly && hasSession !== true) return;
    let alive = true;
    const timer = setTimeout(() => alive && setSlow(key), 300);
    fetchInquiryPage(page, mineOnly).then((r) => {
      clearTimeout(timer);
      if (!alive) return;
      if (!r) return setFailed(key);
      memory.set(key, r);
      setFresh((f) => ({ ...f, [key]: r }));
    });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [key, page, mineOnly, hasSession]);

  const status = needLogin ? "login" : failed === key && !data ? "error" : slow === key && !data ? "loading" : undefined;
  return <BoardView mineOnly={mineOnly} page={page} data={data} status={status} />;
}
