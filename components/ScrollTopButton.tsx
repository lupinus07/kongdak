"use client";

import { useEffect, useState } from "react";

/** 화면이 길어 아래로 내려왔을 때 맨 위로 올려 주는 버튼 */
export function ScrollTopButton({ raised = false }: { raised?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed ${raised ? "bottom-[130px]" : "bottom-6"} right-[max(16px,calc(50%-179px))] z-30 flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_18px_rgba(194,37,92,0.35)]`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 15l6-6 6 6" />
      </svg>
    </button>
  );
}
