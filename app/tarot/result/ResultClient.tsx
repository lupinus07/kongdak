"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/report";
import { ShareSheet, type ShareContent } from "@/components/ShareSheet";
import { TAROT_CARDS } from "@/lib/tarot-cards";
import { fetchInterpretation, type TarotInterpretation } from "@/lib/tarot-interpretation";
import { TAROT_TOPICS, parseTopic } from "@/lib/tarot";
import { drawResultHref, getTodayDraw, type DailyDraw } from "@/lib/tarot-daily";
import { renderTarotImage } from "@/lib/tarot-image";
import { sharePath } from "@/lib/tarot-share";

const sectionTitle = "font-title text-base text-brand";
const bodyText = "m-0 text-sm leading-relaxed text-[#6B4A58]";

/** 카카오톡·인스타그램 등 앱 안 브라우저. 공유·다운로드가 막혀 있는 경우가 많아 이미지를 길게 눌러 저장하게 한다. */
const IN_APP_BROWSER = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\//i;
const KAKAOTALK = /KAKAOTALK/i;

/** 아이폰·아이패드(데스크톱 모드 아이패드 포함). 사진 앱 저장은 공유 시트로만 되고, 내려받기는 '파일' 앱으로 간다. */
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  // 바로 해제하면 일부 브라우저에서 다운로드가 취소된다
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** 길게 눌러 저장할 때 앱 안 브라우저가 이미지를 다시 읽을 수 있도록, 페이지 메모리 주소(blob:) 대신 data: 주소로 바꾼다. */
function toDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ResultClient() {
  const params = useSearchParams();
  // 하루 1장: 오늘 뽑은 카드가 있으면 주소의 값보다 그 카드를 우선한다.
  const [daily, setDaily] = useState<DailyDraw | null>(null);
  useEffect(() => {
    // localStorage는 마운트 뒤에만 읽을 수 있다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaily(getTodayDraw());
  }, []);
  const topicId = daily?.topic ?? parseTopic(params.get("topic"));
  const topicLabel = TAROT_TOPICS.find((t) => t.id === topicId)!.label;
  const cardParam = params.get("card");
  const card = daily ? TAROT_CARDS[daily.card] : cardParam === null ? undefined : TAROT_CARDS[Number(cardParam)];
  const reversed = daily ? daily.reversed : params.get("rev") === "1";

  // 뽑은 카드가 바뀌면 key도 바뀌어서, 이전 카드의 풀이를 보여주지 않고 다시 불러온다.
  const key = card ? `${card.id}-${reversed ? 1 : 0}-${topicId}` : "";
  const [loaded, setLoaded] = useState<{ key: string; r: TarotInterpretation | null } | null>(null);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<{ key: string; file: File } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [share, setShare] = useState<ShareContent | null>(null);
  const [inKakao, setInKakao] = useState(false);
  useEffect(() => {
    if (!card) return;
    let alive = true;
    fetchInterpretation(card.id, reversed, topicId).then((r) => alive && setLoaded({ key, r }));
    return () => {
      alive = false;
    };
  }, [card, reversed, topicId, key, retry]);

  const r = loaded?.key === key ? loaded.r : undefined;

  // 공유 시트는 버튼을 누른 직후에만 열리므로, 풀이가 오면 저장용 이미지를 미리 만들어 둔다.
  useEffect(() => {
    if (!card || !r) return;
    let alive = true;
    renderTarotImage({
      cardImage: `/tarot/${String(card.id).padStart(2, "0")}.webp`,
      cardName: card.ko,
      reversed,
      topicLabel,
      interpretation: r,
    })
      .then((blob) => alive && setImage({ key, file: new File([blob], `kongdak-tarot-${card.id}.png`, { type: "image/png" }) }))
      .catch(() => {}); // 실패하면 버튼을 누를 때 다시 만든다
    return () => {
      alive = false;
    };
  }, [card, r, reversed, topicLabel, key]);

  // 카톡에서 '다른 브라우저로 열기'로 넘어온 경우(?save=1): 이미지가 준비되면 바로 내려받는다 (아이폰은 탭이 필요해 제외)
  const autoSaved = useRef(false);
  useEffect(() => {
    if (autoSaved.current || params.get("save") !== "1" || image?.key !== key) return;
    if (isIOS() || IN_APP_BROWSER.test(navigator.userAgent)) return;
    autoSaved.current = true;
    downloadFile(image.file);
    const url = new URL(location.href);
    url.searchParams.delete("save");
    history.replaceState(history.state, "", url);
  }, [params, image, key]);

  if (!card) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="m-0 text-ink-sub">카드를 찾지 못했어요. 다시 뽑아볼까요?</p>
        <Link href="/tarot" className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline">
          타로 다시 보기
        </Link>
      </div>
    );
  }

  // 모바일은 공유 시트(이미지 저장·카카오톡 등)를 열고, 지원하지 않으면 파일로 내려받는다.
  async function saveImage() {
    if (!r || saving) return;
    let file = image?.key === key ? image.file : null;
    if (!file) {
      setSaving(true);
      try {
        const blob = await renderTarotImage({
          cardImage: `/tarot/${String(card!.id).padStart(2, "0")}.webp`,
          cardName: card!.ko,
          reversed,
          topicLabel,
          interpretation: r,
        });
        file = new File([blob], `kongdak-tarot-${card!.id}.png`, { type: "image/png" });
      } catch {
        alert("이미지를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.");
        return;
      } finally {
        setSaving(false);
      }
    }

    const inApp = IN_APP_BROWSER.test(navigator.userAgent);
    // PC·안드로이드 브라우저는 바로 내려받는다 (안드로이드 공유 시트에는 '저장'이 없는 경우가 많다)
    if (!inApp && !isIOS()) {
      downloadFile(file);
      return;
    }
    // 아이폰은 공유 시트의 '이미지 저장'으로 사진 앱에 저장한다
    if (!inApp && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // 사용자가 공유 시트를 닫음
        // 공유가 막힌 환경이면 아래 방법으로 넘어간다
      }
    }
    // 카톡 등 앱 안 브라우저는 다운로드를 막아서, 이미지를 띄워 길게 눌러 저장하거나 다른 브라우저로 열게 한다
    setInKakao(KAKAOTALK.test(navigator.userAgent));
    setPreviewUrl(await toDataUrl(file));
  }


  // 친구에게 보낼 공유 내용. 링크에 카드·고민·정역이 담겨 있어 DB에 따로 저장하지 않는다.
  function shareContent(): ShareContent {
    const url = `${location.origin}${sharePath({ card: card!.id, reversed, topic: topicId })}`;
    return {
      url,
      title: `친구가 뽑은 타로 카드는 '${card!.ko}'`,
      text: `${topicLabel} 고민으로 뽑은 오늘의 카드${r ? ` · ${r.headline}` : ""}. 너도 한 장 뽑아봐!`,
      imageUrl: `${url}/opengraph-image`,
      cta: { title: "나도 오늘의 카드 뽑기", url: `${location.origin}/tarot` },
    };
  }

  // 카카오톡 안 브라우저는 저장이 막힐 때가 있어서, 같은 결과를 기본 브라우저(크롬·사파리)로 다시 연다.
  function openInBrowser() {
    const url = `${location.origin}${drawResultHref({ card: card!.id, reversed, topic: topicId })}&save=1`;
    location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="w-[132px] shrink-0 motion-safe:animate-[card-reveal_0.6s_ease-out] rounded-[14px] border-[3px] border-badge bg-white p-1 shadow-[0_10px_22px_rgba(120,20,60,0.18)]">
          <Image
            src={`/tarot/${String(card.id).padStart(2, "0")}.webp`}
            alt={`${card.ko} 카드${reversed ? " (역방향)" : ""}`}
            width={600}
            height={1006}
            priority
            unoptimized
            className={`block h-auto w-full rounded-[9px] ${reversed ? "rotate-180" : ""}`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg bg-brand px-2 py-[3px] text-xs text-white">
              {reversed ? "역방향" : "정방향"}
            </span>
            <span className="text-[14px] text-ink-sub">
              {card.ko} · {card.numeral}
            </span>
          </div>
          <h1 className="m-0 whitespace-pre-line font-title text-2xl font-normal leading-snug">
            {r ? r.headline : r === null ? "풀이를 불러오지 못했어요" : "카드를 읽고 있어요…"}
          </h1>
          {r === null ? (
            <button
              type="button"
              onClick={() => setRetry((n) => n + 1)}
              className="self-start rounded-xl bg-white px-3 py-[5px] text-xs text-brand"
            >
              다시 불러오기
            </button>
          ) : (
            <div className="flex flex-wrap gap-1">
              {r?.keywords.map((k) => (
                <span key={k} className="rounded-xl bg-white px-2.5 py-[5px] text-xs text-[#A61E4D]">
                  #{k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-1.5 rounded-3xl bg-white px-[18px] py-4">
        <span className={sectionTitle}>카드의 의미</span>
        {r ? <p className={bodyText}>{r.meaning}</p> : <Skeleton lines={2} />}
        <div className="my-1 h-px bg-[#F8D4E1]" />
        <span className={sectionTitle}>{topicLabel} 고민에서는</span>
        {r ? <p className={bodyText}>{r.topicReading}</p> : <Skeleton lines={3} />}
      </section>

      <section className="flex items-start gap-3 rounded-3xl bg-[#FFF7D6] px-[18px] py-4">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
          <path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z" fill="#F59F00" />
        </svg>
        <div className="flex flex-col gap-1">
          <span className="font-title text-base text-[#8A5A00]">콩닥 한마디</span>
          {r ? (
            <p className="m-0 text-sm leading-relaxed text-[#6B4A2B]">{r.advice}</p>
          ) : (
            <Skeleton lines={1} tone="#F3E3A6" />
          )}
        </div>
      </section>

      <Link
        href="/love"
        className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3 text-ink no-underline"
      >
        <span className="text-sm">올해 나의 연애운도 궁금하다면?</span>
        <span className="font-title text-sm text-brand">연애운 보기 ›</span>
      </Link>

      <div className="mt-auto flex flex-col gap-2.5">
        <p className="m-0 text-center text-[14px] text-ink-sub">오늘의 무료 카드를 뽑았어요 · 내일 또 만나요</p>
        <p className="m-0 text-center text-xs text-ink-mute">재미와 참고를 위한 콘텐츠예요</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={saveImage}
            disabled={!r || saving}
            className="h-12 flex-1 rounded-[24px] border-2 border-brand bg-white font-title text-base text-brand disabled:opacity-50"
          >
            {saving ? "만드는 중…" : "이미지 저장"}
          </button>
          <button
            type="button"
            onClick={() => setShare(shareContent())}
            className="h-12 flex-1 rounded-[24px] border-2 border-brand bg-white font-title text-base text-brand"
          >
            친구에게 공유
          </button>
        </div>
        <div className="flex">
          <Link
            href="/compat"
            className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-[28px] bg-brand font-title text-[17px] text-white no-underline shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
          >
            그 사람과 궁합 보기
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      {share && <ShareSheet content={share} onClose={() => setShare(null)} />}

      {previewUrl && (
        <div
          role="dialog"
          aria-label="저장할 이미지"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
        >
          <p className="m-0 text-center font-title text-[17px] text-white">이미지를 길게 눌러 저장해 주세요</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- 브라우저에서 만든 이미지(data:)라 next/image를 쓰지 않는다 */}
          <img
            src={previewUrl}
            alt="타로 결과 이미지"
            className="max-h-[66vh] w-auto max-w-full rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {inKakao ? (
            <>
              <p className="m-0 text-center text-[14px] text-white/80">크롬·사파리에서 열면 바로 저장할 수 있어요</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInBrowser();
                  }}
                  className="h-11 rounded-[22px] bg-brand px-5 font-title text-white"
                >
                  다른 브라우저로 열기
                </button>
                <button type="button" className="h-11 rounded-[22px] bg-white px-5 font-title text-brand">
                  닫기
                </button>
              </div>
            </>
          ) : (
            <>
              {IN_APP_BROWSER.test(navigator.userAgent) && (
                <p className="m-0 text-center text-[14px] text-white/80">
                  저장이 안 되면 오른쪽 위 메뉴에서 &lsquo;다른 브라우저로 열기&rsquo;를 눌러 주세요
                </p>
              )}
              <button type="button" className="h-11 rounded-[22px] bg-white px-6 font-title text-brand">
                닫기
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
