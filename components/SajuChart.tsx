import type { Element, Saju } from "@/lib/saju";

const ELEMENT_STYLE: Record<Element, string> = {
  wood: "bg-[#E3F4E1] text-[#2B6B2A]",
  fire: "bg-[#FFE4D6] text-[#B23A07]",
  earth: "bg-[#F7EDCF] text-[#7A5E0A]",
  metal: "bg-[#ECEEF1] text-[#495057]",
  water: "bg-[#DDEBFB] text-[#1B4F8C]",
};

const BAR: Record<Element, { name: string; color: string }> = {
  wood: { name: "木 나무", color: "#51A84E" },
  fire: { name: "火 불", color: "#F76707" },
  earth: { name: "土 흙", color: "#D4AF37" },
  metal: { name: "金 쇠", color: "#ADB5BD" },
  water: { name: "水 물", color: "#4D94E0" },
};

const TITLE = { hour: "시주", day: "일주 · 나", month: "월주", year: "년주" } as const;

function Tg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[12.5px] text-ink-sub ${className}`}>{children}</span>;
}

function Chip({ glyph, reading, el, ring }: { glyph: string; reading: string; el: Element; ring?: boolean }) {
  return (
    <div
      className={`flex size-[62px] flex-col items-center justify-center rounded-[18px] font-hanja text-[26px] leading-none ${ELEMENT_STYLE[el]} ${
        ring ? "shadow-[0_0_0_2.5px_#FF6B9A]" : ""
      }`}
    >
      {glyph}
      <small className="mt-[3px] font-body text-[11.5px]">{reading}</small>
    </div>
  );
}

/** 사주 원국(네 기둥)과 오행 균형. 계산된 Saju 값을 그대로 그린다. */
export function SajuChart({ saju }: { saju: Saju }) {
  const max = Math.max(...Object.values(saju.balance), 1);
  const bars = (Object.keys(saju.balance) as Element[]).sort((a, b) => saju.balance[b] - saju.balance[a]);

  return (
    <>
      <div
        className="grid justify-items-center gap-1.5"
        style={{ gridTemplateColumns: `repeat(${saju.pillars.length}, minmax(0, 1fr))` }}
      >
        {saju.pillars.map((p) => {
          const me = p.key === "day";
          return (
            <div key={p.key} className="flex flex-col items-center gap-1.5">
              <Tg className={me ? "!text-brand" : ""}>{TITLE[p.key]}</Tg>
              <Tg>{p.ganTen}</Tg>
              <Chip glyph={p.gan} reading={p.ganRead} el={p.ganEl} ring={me} />
              <Chip glyph={p.zhi} reading={p.zhiRead} el={p.zhiEl} />
              <Tg>{p.zhiTen}</Tg>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex flex-col gap-[7px]">
        {bars.map((el) => (
          <div key={el} className="grid grid-cols-[52px_1fr_28px] items-center gap-2 text-[14px]">
            <span>{BAR[el].name}</span>
            <div className="h-3 overflow-hidden rounded-md bg-bg">
              <div
                className="h-full"
                style={{ width: `${(saju.balance[el] / max) * 100}%`, background: BAR[el].color }}
              />
            </div>
            <span>{saju.balance[el]}</span>
          </div>
        ))}
      </div>
    </>
  );
}
