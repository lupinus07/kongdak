import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { LoginPrompt } from "@/components/LoginPrompt";
import { PhoneFrame } from "@/components/PhoneFrame";
import { currentUserId, listInquiries, type InquiryListItem } from "@/lib/inquiries";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "문의 게시판",
  description: "콩닥 결제·환불·풀이 문의 게시판. 비밀글로 남기고 답변을 확인할 수 있어요.",
  path: "/inquiry",
});

type Search = { tab?: string; page?: string };

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

export default function InquiryBoardPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <PhoneFrame>
      <BackHeader title="문의 게시판" />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-8 pt-2">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-title text-[24px] font-normal leading-tight">무엇이든 물어보세요</h1>
            <p className="m-0 text-[14px] text-ink-sub">모든 문의는 비밀글로 올라가요.</p>
          </div>
          <Link
            href="/inquiry/new"
            className="flex h-11 shrink-0 items-center rounded-[22px] bg-brand px-4 font-title text-[15px] text-white no-underline"
          >
            문의하기
          </Link>
        </div>
        <Suspense fallback={<p className="m-0 py-8 text-center text-ink-sub">불러오는 중…</p>}>
          <Board searchParams={searchParams} />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}

async function Board({ searchParams }: { searchParams: Promise<Search> }) {
  // 새 글·답변이 바로 보이고, '내 문의'는 로그인 상태(쿠키)에 따라 달라서 요청 때 그린다
  await connection();
  const sp = await searchParams;
  const mineOnly = sp.tab === "mine";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const userId = await currentUserId();
  const { items, hasNext } = await listInquiries({ page, mineOnly, userId });
  const href = (p: number) => `/inquiry?${new URLSearchParams({ ...(mineOnly ? { tab: "mine" } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  const tab = (on: boolean) =>
    `flex-1 rounded-[14px] py-2 text-center text-[14.5px] no-underline ${on ? "bg-white font-title text-brand shadow-sm" : "text-ink-sub"}`;

  return (
    <>
      <nav className="flex gap-1 rounded-[18px] bg-[#F8E1EA] p-1" aria-label="문의 보기">
        <Link href="/inquiry" className={tab(!mineOnly)} aria-current={!mineOnly ? "page" : undefined}>
          전체 문의
        </Link>
        <Link href="/inquiry?tab=mine" className={tab(mineOnly)} aria-current={mineOnly ? "page" : undefined}>
          내 문의
        </Link>
      </nav>

      {mineOnly && !userId ? (
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
      ) : items.length === 0 ? (
        <p className="m-0 rounded-[22px] bg-white py-10 text-center text-[14.5px] text-ink-sub">
          {mineOnly ? "아직 남긴 문의가 없어요." : page > 1 ? "더 이상 문의가 없어요." : "아직 문의가 없어요."}
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-[#F8E1EA] rounded-[22px] bg-white px-3 py-1">
          {items.map((q) => (
            <Row key={q.code} q={q} />
          ))}
        </ul>
      )}

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
