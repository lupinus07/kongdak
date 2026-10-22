"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getKakao, loadKakao } from "@/lib/kakao-share";

export type ShareContent = {
  /** 공유할 페이지 주소(절대 주소) */
  url: string;
  title: string;
  /** 메시지 본문 한 줄 (X·밴드·기본 공유창에 함께 들어간다) */
  text: string;
  /** 카카오톡 메시지 카드 그림(절대 주소, 1200×630) */
  imageUrl: string;
  /** 카카오톡 메시지 카드 아래 버튼 */
  cta: { title: string; url: string };
};

type Target = { key: string; label: string; icon: ReactNode; onClick: () => void };

function Circle({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span className="flex size-14 items-center justify-center rounded-full" style={{ background: bg }}>
      {children}
    </span>
  );
}

function open(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** 친구에게 공유하기 바텀시트: 카카오톡 · X · 밴드 · 더보기(휴대폰 기본 공유창) + 주소 복사. */
export function ShareSheet({ content, onClose }: { content: ShareContent; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  useEffect(() => {
    // 카카오 공유는 버튼을 누른 즉시 보내야 해서 시트가 열릴 때 SDK를 미리 불러 둔다
    loadKakao();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const { url, title, text } = content;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      prompt("이 링크를 복사해서 친구에게 보내 주세요", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // 사용자가 닫았거나 막힌 환경
    }
  }

  function shareKakao() {
    const kakao = getKakao();
    if (!kakao) {
      // 카카오 키가 없거나 SDK를 못 불러오면 기본 공유창(없으면 링크 복사)으로 대신한다
      return canNativeShare ? nativeShare() : copy();
    }
    const link = { mobileWebUrl: url, webUrl: url };
    const cta = { mobileWebUrl: content.cta.url, webUrl: content.cta.url };
    kakao.Share.sendDefault({
      objectType: "feed",
      content: { title, description: text, imageUrl: content.imageUrl, imageWidth: 1200, imageHeight: 630, link },
      buttons: [
        { title: "자세히 보기", link },
        { title: content.cta.title, link: cta },
      ],
    });
  }

  const targets: Target[] = [
    {
      key: "kakao",
      label: "카카오톡",
      onClick: shareKakao,
      icon: (
        <Circle bg="#FEE500">
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4C6.8 4 3 7.2 3 11.1c0 2.5 1.6 4.7 4.1 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.3 0 .7.1 1 .1 5.2 0 9-3.2 9-7.2S17.2 4 12 4z" fill="#3C1E1E" />
          </svg>
        </Circle>
      ),
    },
    {
      key: "x",
      label: "X",
      onClick: () => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`),
      icon: (
        <Circle bg="#000000">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFFFFF" />
          </svg>
        </Circle>
      ),
    },
    {
      key: "band",
      label: "밴드",
      onClick: () =>
        open(`https://band.us/plugin/share?body=${encodeURIComponent(`${text}\n${url}`)}&route=${encodeURIComponent(location.host)}`),
      icon: (
        <Circle bg="#00C73C">
          <span className="font-title text-[26px] leading-none text-white">b</span>
        </Circle>
      ),
    },
  ];
  if (canNativeShare) {
    targets.push({
      key: "more",
      label: "더보기",
      onClick: nativeShare,
      icon: (
        <Circle bg="#F3EEF0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#7A5566" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </Circle>
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_0.2s_ease] bg-[rgba(60,25,40,0.48)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="absolute bottom-0 flex w-full max-w-[390px] animate-[sheet-up_0.25s_ease] flex-col items-center gap-5 rounded-t-[32px] bg-white px-5 pb-[30px] pt-3"
      >
        <div className="h-[5px] w-11 rounded-[3px] bg-[#F3C6D6]" />
        <h2 id="share-title" className="m-0 font-title text-[22px] font-normal">
          친구에게 공유하기
        </h2>
        <div className="flex w-full justify-center gap-3">
          {targets.map((t) => (
            <button key={t.key} type="button" onClick={t.onClick} className="flex w-14 flex-col items-center gap-1.5">
              {t.icon}
              <span className="whitespace-nowrap text-xs text-ink-sub">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="flex h-12 w-full items-center overflow-hidden rounded-[14px] border border-[#F3C6D6]">
          <span className="min-w-0 flex-1 truncate px-3.5 text-[13px] text-ink-sub">{url}</span>
          <button
            type="button"
            onClick={copy}
            className="h-full shrink-0 border-l border-[#F3C6D6] bg-[#FFF5F8] px-4 font-title text-sm text-brand"
          >
            {copied ? "복사했어요" : "URL 복사"}
          </button>
        </div>
      </div>
    </div>
  );
}
