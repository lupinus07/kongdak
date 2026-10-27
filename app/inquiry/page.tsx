import Link from "next/link";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { loadFirstPage } from "@/lib/inquiry-list-cache";
import { pageMetadata } from "@/lib/site";
import { BoardClient, BoardView } from "./BoardClient";

export const metadata = pageMetadata({
  title: "문의 게시판",
  description: "콩닥 결제·환불·풀이 문의 게시판. 비밀글로 남기고 답변을 확인할 수 있어요.",
  path: "/inquiry",
});

/** 첫 쪽 목록까지 미리 만들어 두고(열자마자 보이게), 다른 탭·쪽과 '내 글' 표시는 브라우저가 바로 읽어 온다(BoardClient). */
export default async function InquiryBoardPage() {
  const initial = await loadFirstPage();
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
        {/* 주소의 ?tab=·?page=를 읽어서 Suspense가 필요하다. 기다리는 동안에도 미리 만든 첫 쪽 목록을 그대로 보여준다. */}
        <Suspense fallback={<BoardView mineOnly={false} page={1} data={initial} />}>
          <BoardClient initial={initial} />
        </Suspense>
      </main>
    </PhoneFrame>
  );
}
