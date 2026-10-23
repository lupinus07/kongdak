"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EVERY_MS = 4000;
const MAX_TRIES = 50; // 약 3분. 서버의 생성 잠금(3분)과 맞춘다

/** 풀이가 만들어질 때까지 몇 초마다 서버 화면을 다시 불러온다. 너무 오래 걸리면 멈추고 안내한다. */
export function PollRefresh() {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      if (++tries > MAX_TRIES) {
        clearInterval(id);
        setGaveUp(true);
        return;
      }
      router.refresh();
    }, EVERY_MS);
    return () => clearInterval(id);
  }, [router]);

  if (!gaveUp) return null;
  return (
    <p className="m-0 text-sm leading-relaxed text-ink-sub">
      풀이가 아직 나오지 않았어요. 잠시 후 이 페이지를 새로고침해 주세요.
      <br />
      계속 안 되면 문의해 주세요. 풀이를 열지 못한 경우에는 환불해 드려요.
    </p>
  );
}
