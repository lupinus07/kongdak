import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Skeleton } from "@/components/report";
import { createPublicClient } from "@/lib/supabase/public";
import { TAROT_TOPICS, TAROT_TOPIC_QUESTIONS } from "@/lib/tarot";
import { TAROT_CARDS } from "@/lib/tarot-cards";
import { fetchInterpretation } from "@/lib/tarot-interpretation";
import { pageMetadata } from "@/lib/site";
import { parseShareCode, sharePath } from "@/lib/tarot-share";

type Props = { params: Promise<{ code: string }> };

/** 카톡 등에 링크를 붙였을 때 보이는 제목·설명. 미리보기 그림은 같은 폴더의 opengraph-image.tsx가 만든다. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const share = parseShareCode((await params).code);
  if (!share) return { title: "콩닥 타로" };
  const card = TAROT_CARDS[share.card];
  const topic = TAROT_TOPICS.find((t) => t.id === share.topic)!.label;
  const direction = share.reversed ? "역방향" : "정방향";
  // 검색 제목은 "카드 + 방향 + 고민"(예: 죽음 역방향 타로 풀이 · 이별 · 재회), 메신저 미리보기는 친구 공유 문구
  const meta = pageMetadata({
    title: `${card.ko} ${direction} 타로 풀이 · ${topic}`,
    description: `${topic} 고민에 ${card.ko} ${direction} 카드가 나왔다면? ${TAROT_TOPIC_QUESTIONS[share.topic]} 콩닥 연애 타로 풀이를 확인하고 나도 오늘의 카드 한 장 뽑아 보세요.`,
    path: sharePath(share),
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      title: `친구가 뽑은 타로 카드는 '${card.ko}'`,
      // 사이트 기본 그림 대신 이 카드의 미리보기 그림(같은 폴더의 opengraph-image.tsx)
      images: [{ url: `${sharePath(share)}/opengraph-image`, width: 1200, height: 630, alt: `${card.ko} ${direction} 타로 카드` }],
    },
  };
}

/** 친구가 공유한 타로 결과. 링크에 담긴 카드를 보여주고(하루 1장 기록과 무관), 나도 뽑아보게 이끈다. */
export default function TarotSharePage({ params }: Props) {
  return (
    <PhoneFrame>
      <BackHeader title="친구가 뽑은 카드" href="/" />
      <main className="flex flex-1 flex-col gap-3.5 px-[22px] pb-6 pt-2">
        <Suspense fallback={<Skeleton lines={6} />}>
          <ShareBody params={params} />
        </Suspense>
        <div className="mt-auto flex flex-col gap-2.5 pt-2">
          <p className="m-0 text-center text-xs text-ink-mute">재미와 참고를 위한 콘텐츠예요</p>
          <Link
            href="/tarot"
            className="flex h-14 items-center justify-center gap-1.5 rounded-[28px] bg-brand font-title text-[18px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
          >
            나도 오늘의 카드 뽑기
          </Link>
          <Link href="/" className="p-1 text-center text-sm text-brand">
            콩닥 둘러보기 ›
          </Link>
        </div>
      </main>
    </PhoneFrame>
  );
}

async function ShareBody({ params }: Props) {
  const share = parseShareCode((await params).code);
  if (!share) {
    return <p className="m-0 py-10 text-center text-ink-sub">카드 정보를 찾지 못했어요. 나도 한 장 뽑아볼까요?</p>;
  }
  const card = TAROT_CARDS[share.card];
  const topic = TAROT_TOPICS.find((t) => t.id === share.topic)!.label;
  const r = await fetchInterpretation(share.card, share.reversed, share.topic, createPublicClient());

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="rounded-xl bg-badge px-3 py-1 text-xs text-ink">친구가 뽑은 오늘의 카드</span>
        <p className="m-0 text-sm text-ink-sub">
          {topic} · {TAROT_TOPIC_QUESTIONS[share.topic]}
        </p>
      </div>

      <div className="w-[150px] self-center rounded-[14px] border-[3px] border-badge bg-white p-1 shadow-[0_10px_22px_rgba(120,20,60,0.18)]">
        <Image
          src={`/tarot/${String(card.id).padStart(2, "0")}.webp`}
          alt={`${card.ko} 카드${share.reversed ? " (역방향)" : ""}`}
          width={600}
          height={1006}
          priority
          unoptimized
          className={`block h-auto w-full rounded-[9px] ${share.reversed ? "rotate-180" : ""}`}
        />
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-[14px] text-ink-sub">
          {card.ko} · {share.reversed ? "역방향" : "정방향"}
        </span>
        {r && <h1 className="m-0 font-title text-2xl font-normal leading-snug">{r.headline}</h1>}
      </div>

      {r ? (
        <section className="flex flex-col gap-1.5 rounded-3xl bg-white px-[18px] py-4">
          <span className="font-title text-base text-brand">{topic} 고민에서는</span>
          <p className="m-0 text-sm leading-relaxed text-[#6B4A58]">{r.topicReading}</p>
        </section>
      ) : (
        <p className="m-0 text-center text-sm text-ink-sub">풀이를 불러오지 못했어요.</p>
      )}
    </>
  );
}
