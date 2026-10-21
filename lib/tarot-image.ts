import type { TarotInterpretation } from "@/lib/tarot-interpretation";

export type TarotImageInput = {
  cardImage: string;
  cardName: string;
  reversed: boolean;
  topicLabel: string;
  interpretation: TarotInterpretation;
};

const W = 780;
const PAD = 52;

/** next/font가 만든 폰트 이름을 CSS 변수에서 읽는다 (캔버스는 변수를 못 읽는다). */
function fontFamily(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch.trimStart();
      } else {
        line += ch;
      }
    }
    lines.push(line);
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** 결과 화면을 공유용 이미지(PNG)로 그린다. 서버 호출 없이 브라우저에서만 만든다. */
export async function renderTarotImage(input: TarotImageInput): Promise<Blob> {
  const title = fontFamily("--font-jua", "sans-serif");
  const body = fontFamily("--font-gowun", "sans-serif");
  await Promise.all([document.fonts.load(`40px ${title}`), document.fonts.load(`28px ${body}`)]);
  const img = await loadImage(input.cardImage);
  const { interpretation: r } = input;

  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `28px ${body}`;
  const innerW = W - PAD * 2 - 56;
  const meaningLines = wrap(measure, r.meaning, innerW);
  const topicLines = wrap(measure, r.topicReading, innerW);
  const adviceLines = wrap(measure, r.advice, innerW);
  measure.font = `46px ${title}`;
  const headlineLines = wrap(measure, r.headline, W - PAD * 2);

  const cardW = 300;
  const cardH = Math.round((cardW * img.height) / img.width);
  const LH = 44;
  const readingH = 40 + 44 + meaningLines.length * LH + 36 + 44 + topicLines.length * LH + 40;
  const adviceH = 40 + 44 + adviceLines.length * LH + 36;
  const H = 150 + cardH + 40 + 50 + headlineLines.length * 62 + 70 + readingH + 28 + adviceH + 130;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#FFF0F5";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#C2255C";
  ctx.font = `44px ${title}`;
  ctx.fillText("콩닥", W / 2, 84);
  ctx.fillStyle = "#7A5566";
  ctx.font = `24px ${body}`;
  ctx.fillText(`${input.topicLabel} 고민 타로`, W / 2, 122);

  // 카드
  const cx = (W - cardW) / 2;
  const cy = 150;
  ctx.save();
  ctx.shadowColor = "rgba(120,20,60,0.2)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cx - 10, cy - 10, cardW + 20, cardH + 20, 22);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#FFD43B";
  ctx.lineWidth = 5;
  roundRect(ctx, cx - 10, cy - 10, cardW + 20, cardH + 20, 22);
  ctx.stroke();
  ctx.save();
  roundRect(ctx, cx, cy, cardW, cardH, 14);
  ctx.clip();
  if (input.reversed) {
    ctx.translate(cx + cardW / 2, cy + cardH / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
  } else {
    ctx.drawImage(img, cx, cy, cardW, cardH);
  }
  ctx.restore();

  // 배지 + 카드 이름
  let y = cy + cardH + 70;
  ctx.font = `26px ${body}`;
  ctx.fillStyle = "#7A5566";
  ctx.fillText(`${input.cardName} · ${input.reversed ? "역방향" : "정방향"}`, W / 2, y);

  // 제목
  y += 62;
  ctx.fillStyle = "#4A2B38";
  ctx.font = `46px ${title}`;
  for (const l of headlineLines) {
    ctx.fillText(l, W / 2, y);
    y += 62;
  }
  y -= 62;

  // 풀이 카드
  y += 40;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, PAD, y, W - PAD * 2, readingH, 36);
  ctx.fill();
  ctx.textAlign = "left";
  let ty = y + 40 + 30;
  const tx = PAD + 28;
  const drawBlock = (heading: string, lines: string[]) => {
    ctx.fillStyle = "#C2255C";
    ctx.font = `30px ${title}`;
    ctx.fillText(heading, tx, ty);
    ty += 44;
    ctx.fillStyle = "#6B4A58";
    ctx.font = `28px ${body}`;
    for (const l of lines) {
      ctx.fillText(l, tx, ty);
      ty += LH;
    }
  };
  drawBlock("카드의 의미", meaningLines);
  ty += 8;
  ctx.fillStyle = "#F8D4E1";
  ctx.fillRect(tx, ty - 28, innerW, 2);
  ty += 24;
  drawBlock(`${input.topicLabel} 고민에서는`, topicLines);

  // 콩닥 한마디
  y += readingH + 28;
  ctx.fillStyle = "#FFF7D6";
  roundRect(ctx, PAD, y, W - PAD * 2, adviceH, 36);
  ctx.fill();
  ty = y + 40 + 30;
  ctx.fillStyle = "#8A5A00";
  ctx.font = `30px ${title}`;
  ctx.fillText("콩닥 한마디", tx, ty);
  ty += 44;
  ctx.fillStyle = "#6B4A2B";
  ctx.font = `28px ${body}`;
  for (const l of adviceLines) {
    ctx.fillText(l, tx, ty);
    ty += LH;
  }

  // 하단 안내
  ctx.textAlign = "center";
  ctx.fillStyle = "#9C7A88";
  ctx.font = `22px ${body}`;
  ctx.fillText("재미와 참고를 위한 콘텐츠예요", W / 2, H - 62);
  ctx.fillStyle = "#C2255C";
  ctx.font = `26px ${title}`;
  ctx.fillText("콩닥콩닥 · 오늘의 타로", W / 2, H - 28);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/png"),
  );
}
