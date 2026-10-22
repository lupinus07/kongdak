import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadJua } from "@/lib/og-font";

/** 사이트 기본 미리보기 그림(1200×630). 카톡·검색 결과에 사이트 링크를 붙였을 때 보인다. */

export const alt = "콩닥 - 무료 연애 타로 · 사주 궁합 · 연애운";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LINES = {
  brand: "콩닥",
  catch: "우리 사이, 콩닥콩닥할까?",
  menu: ["무료 연애 타로", "사주 궁합", "나의 연애운"],
  sub: "짝사랑 · 속마음 · 썸 · 재회 · 고백 타이밍",
};

export default async function Image() {
  const font = await loadJua(`${LINES.brand}${LINES.catch}${LINES.menu.join("")}${LINES.sub}`);
  const icon = `data:image/png;base64,${(await readFile(join(process.cwd(), "app/icon.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#FFF0F5", padding: "0 90px", fontFamily: "Jua", color: "#4A2B38" }}>
        <img src={icon} width={300} height={300} style={{ borderRadius: 64, boxShadow: "0 16px 40px rgba(194,37,92,0.25)" }} alt="" />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70 }}>
          <div style={{ display: "flex", fontSize: 96, color: "#C2255C" }}>{LINES.brand}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 50 }}>{LINES.catch}</div>
          <div style={{ display: "flex", marginTop: 34, gap: 14 }}>
            {LINES.menu.map((m) => (
              <div key={m} style={{ display: "flex", background: "#fff", color: "#C2255C", borderRadius: 30, padding: "10px 24px", fontSize: 32 }}>
                {m}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#7A5566" }}>{LINES.sub}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Jua", data: font, weight: 400, style: "normal" }] },
  );
}
