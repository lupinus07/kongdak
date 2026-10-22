import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";
import { TAROT_TOPICS, TAROT_TOPIC_QUESTIONS } from "@/lib/tarot";
import { TAROT_CARDS } from "@/lib/tarot-cards";
import { fetchInterpretation } from "@/lib/tarot-interpretation";
import { parseShareCode } from "@/lib/tarot-share";

/** 카톡·메신저에 공유 링크를 붙였을 때 뜨는 미리보기 그림(1200×630). 요청 때 만들고 캐시된다. */

export const alt = "친구가 뽑은 콩닥 타로 카드";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 그림에 들어가는 글자만 담은 Jua 폰트를 Google Fonts에서 받는다 (전체 한글 폰트는 너무 커서). */
async function loadJua(text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=Jua&text=${encodeURIComponent(text)}`)
  ).text();
  const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
  if (!url) throw new Error("Jua 폰트를 찾지 못했어요");
  return (await fetch(url)).arrayBuffer();
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const share = parseShareCode((await params).code);
  const card = share ? TAROT_CARDS[share.card] : null;
  const topic = share ? TAROT_TOPICS.find((t) => t.id === share.topic)!.label : "";
  const question = share ? TAROT_TOPIC_QUESTIONS[share.topic] : "";
  const r = share ? await fetchInterpretation(share.card, share.reversed, share.topic, createPublicClient()) : null;

  const lines = {
    badge: "친구가 뽑은 오늘의 카드",
    topic: share ? `${topic} · ${question}` : "",
    name: card ? `${card.ko} · ${share!.reversed ? "역방향" : "정방향"}` : "",
    headline: r?.headline ?? "카드가 건네는 이야기",
    cta: "나도 오늘의 카드 뽑기 ›",
  };
  const font = await loadJua(`콩닥${Object.values(lines).join("")}`);
  const cardImage = card
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "assets/tarot-og", `${String(card.id).padStart(2, "0")}.jpg`))).toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#FFF0F5", padding: "0 80px", fontFamily: "Jua", color: "#4A2B38" }}>
        {cardImage && (
          <div style={{ display: "flex", padding: 8, background: "#fff", border: "6px solid #FFD43B", borderRadius: 24, boxShadow: "0 16px 40px rgba(120,20,60,0.2)" }}>
            <img src={cardImage} width={270} height={453} style={{ borderRadius: 14, transform: share!.reversed ? "rotate(180deg)" : "none" }} alt="" />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 44, color: "#C2255C" }}>콩닥</div>
          <div style={{ display: "flex", marginTop: 18, alignSelf: "flex-start", background: "#FFD43B", borderRadius: 18, padding: "6px 18px", fontSize: 28 }}>{lines.badge}</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: "#7A5566" }}>{lines.topic}</div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 30, color: "#7A5566" }}>{lines.name}</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 60, lineHeight: 1.2 }}>{lines.headline}</div>
          <div style={{ display: "flex", marginTop: 36, alignSelf: "flex-start", background: "#C2255C", color: "#fff", borderRadius: 40, padding: "14px 34px", fontSize: 32 }}>{lines.cta}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Jua", data: font, weight: 400, style: "normal" }] },
  );
}
