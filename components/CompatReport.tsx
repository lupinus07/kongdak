import type { ReactNode } from "react";
import { Chap, H, Li, P, Sec } from "@/components/report";
import { SajuChart } from "@/components/SajuChart";
import type { CompatReading } from "@/lib/compat-reading";
import type { Element, Saju } from "@/lib/saju";
import { elementFill } from "@/lib/saju-facts";

/** 둘의 궁합 풀이 화면. 결제 후 결과와 고정 샘플이 같은 모양으로 보이도록 한 곳에서 그린다. */

export type CompatPerson = { label: string; saju: Saju; dateLabel: string };

const EL_NAME: Record<Element, string> = { wood: "木 나무", fire: "火 불", earth: "土 흙", metal: "金 쇠", water: "水 물" };

/** 풀이 문장의 **강조**를 굵은 글씨로 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))}
    </>
  );
}

const stroke = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Person({ label, dateLabel }: { label: string; dateLabel: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-lg bg-[#FFE3EC] px-2 py-[3px] font-title text-[13px] text-brand">{label}</span>
      <span className="text-[13px] text-ink-sub">{dateLabel}</span>
    </div>
  );
}

/** 내게 없는 오행 → 상대 원국에서 그 기운을 가진 글자 */
function FillRows({ me, you }: { me: CompatPerson; you: CompatPerson }) {
  const rows = [
    { who: me, from: you, fill: elementFill(me.saju, you.saju) },
    { who: you, from: me, fill: elementFill(you.saju, me.saju) },
  ].filter((r) => r.fill.length > 0);
  if (!rows.length) return null;
  return (
    <>
      {rows.map(({ who, from, fill }) => {
        const chars = fill.filter((f) => f.chars.length).map((f) => f.chars.join(" "));
        return (
          <div key={who.label} className="flex items-center gap-2.5 rounded-[18px] bg-[#FFF8FA] p-3.5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[12.5px] text-ink-sub">{who.label}에게 없는 기운</span>
              <b className="font-title text-[17px] font-normal text-ink">{fill.map((f) => EL_NAME[f.element]).join(" · ")}</b>
            </div>
            <svg {...stroke} stroke="#FF6B9A">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
              <span className="text-[12.5px] text-ink-sub">{chars.length ? `${from.label}에게 있어요` : "둘 다 적어요"}</span>
              <b className="font-hanja text-[17px] font-normal text-brand">{chars.length ? chars.join(" · ") : "함께 채워요"}</b>
            </div>
          </div>
        );
      })}
    </>
  );
}

const POINT = {
  good: { bg: "#FFE3EC", color: "#C2255C", icon: "M5 12l5 5L20 7" },
  care: { bg: "#FFF1DE", color: "#C25A00", icon: "M12 7v6M12 17v.5" },
  tip: { bg: "#E3F4E1", color: "#2B6B2A", icon: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" },
};

function Points({ items, tone }: { items: { title: string; body: string }[]; tone: keyof typeof POINT }) {
  const s = POINT[tone];
  return (
    <>
      {items.map((it) => (
        <div key={it.title} className="flex items-start gap-3 rounded-[20px] bg-[#FFF8FA] px-3.5 py-3.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: s.bg }}>
            <svg {...stroke} stroke={s.color}>
              <path d={s.icon} />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <b className="font-title text-[15.5px] font-normal text-ink">{it.title}</b>
            <p className="m-0 text-[14.5px] leading-[1.7] text-[#5E3F4C]">
              <Rich text={it.body} />
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

const COLOR_HEX: [string, string][] = [
  ["연두", "#8CCB5E"],
  ["초록", "#51A84E"],
  ["빨강", "#E03131"],
  ["코랄", "#FF8A73"],
  ["노랑", "#FFD43B"],
  ["베이지", "#E9D8B4"],
  ["흰색", "#FFFFFF"],
  ["은색", "#CED4DA"],
  ["검정", "#343A40"],
  ["남색", "#364FC7"],
];

function Lucky({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-1.5 py-2.5 text-center">
      <div className="flex h-6 items-center">{children}</div>
      <span className="text-[12.5px] text-ink-sub">{label}</span>
      <b className="font-title text-sm font-normal">{value}</b>
    </div>
  );
}

function Swatches({ color }: { color: string }) {
  const found = COLOR_HEX.filter(([name]) => color.includes(name)).slice(0, 2);
  const list = found.length ? found : [["", "#FF6B9A"] as [string, string]];
  return (
    <div className="flex">
      {list.map(([name, hex], i) => (
        <div key={name || i} className={`size-6 rounded-full border border-[#E5DDE0] ${i ? "-ml-2" : ""}`} style={{ background: hex }} />
      ))}
    </div>
  );
}

export function CompatReport({
  me,
  you,
  relation,
  score,
  reading: r,
  chartNote,
}: {
  me: CompatPerson;
  you: CompatPerson;
  relation: string;
  score: number;
  reading: CompatReading;
  /** CHAPTER 1 아래 덧붙이는 안내 (예: 태어난 시간이 추정일 때) */
  chartNote?: ReactNode;
}) {
  const ring = 2 * Math.PI * 70;
  const couple = relation === "부부" || relation === "연애 중";
  return (
    <>
      <section className="flex flex-col items-center gap-2.5 rounded-[30px] bg-brand px-5 py-6 text-center text-white">
        <span className="text-[14px] text-[#FFE3EC]">
          {relation} · {me.label} ♥ {you.label}
        </span>
        <div className="relative size-[150px]">
          <svg width="150" height="150" viewBox="0 0 168 168" aria-hidden="true">
            <circle cx="84" cy="84" r="70" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="16" />
            <circle
              cx="84"
              cy="84"
              r="70"
              fill="none"
              stroke="#FFD43B"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${(ring * score) / 100} ${ring}`}
              transform="rotate(-90 84 84)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] text-[#FFE3EC]">콩닥지수</span>
            <span className="font-title text-[46px] leading-none">
              {score}
              <span className="text-xl">%</span>
            </span>
          </div>
        </div>
        <h1 className="m-0 font-title text-[27px] font-normal leading-[1.3]">
          {r.hero.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="m-0 text-[15px] leading-[1.7] text-[#FFE3EC]">{r.hero.summary}</p>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {r.hero.tags.map((t) => (
            <span key={t} className="rounded-xl bg-white/20 px-[11px] py-[5px] text-[13.5px]">
              #{t}
            </span>
          ))}
        </div>
      </section>

      <Sec>
        <Chap>CHAPTER 1</Chap>
        <H>두 사람의 사주 원국</H>
        <Person label={me.label} dateLabel={me.dateLabel} />
        <SajuChart saju={me.saju} dayLabel={`일주 · ${me.label}`} />
        <div className="my-1 h-px bg-[#F8D4E1]" />
        <Person label={you.label} dateLabel={you.dateLabel} />
        <SajuChart saju={you.saju} dayLabel={`일주 · ${you.label}`} />
        <P>
          <Rich text={r.pillarsNote} />
        </P>
        {chartNote}
      </Sec>

      <Sec>
        <Chap>CHAPTER 2</Chap>
        <H>
          오행으로 보는 우리
          <br />“{r.elements.quote}”
        </H>
        <FillRows me={me} you={you} />
        {r.elements.paragraphs.map((p, i) => (
          <P key={i}>
            <Rich text={p} />
          </P>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 3</Chap>
        <H>
          두 사람의 마음 궁합
          <br />“{r.heart.quote}”
        </H>
        {r.heart.paragraphs.map((p, i) => (
          <P key={i}>
            <Rich text={p} />
          </P>
        ))}
        {r.heart.bullets.map((b, i) => (
          <Li key={i}>
            <Rich text={b} />
          </Li>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 4</Chap>
        <H>
          {couple ? "배우자 자리" : "서로를 잇는 자리"}
          <br />“{r.bond.quote}”
        </H>
        {r.bond.paragraphs.map((p, i) => (
          <P key={i}>
            <Rich text={p} />
          </P>
        ))}
        {r.bond.bullets.map((b, i) => (
          <Li key={i}>
            <Rich text={b} />
          </Li>
        ))}
      </Sec>

      <Sec>
        <Chap>CHAPTER 5</Chap>
        <H>잘 맞는 점</H>
        <Points items={r.good} tone="good" />
      </Sec>

      <Sec>
        <Chap>CHAPTER 6</Chap>
        <H>살짝 조심할 점</H>
        <Points items={r.care} tone="care" />
      </Sec>

      <Sec>
        <Chap>CHAPTER 7</Chap>
        <H>더 가까워지는 팁</H>
        <Points items={r.tips} tone="tip" />
      </Sec>

      <Sec className="bg-[#FFF7D6]">
        <Chap className="text-[#8A5A00]">콩닥 한마디</Chap>
        <H className="text-[#5C3D00]">
          {r.closing.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </H>
        <div className="grid grid-cols-3 gap-2">
          <Lucky label="우리의 색" value={r.closing.color}>
            <Swatches color={r.closing.color} />
          </Lucky>
          <Lucky label="우리의 장소" value={r.closing.place}>
            <svg {...stroke} width={22} height={22} stroke="#C2255C">
              <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </Lucky>
          <Lucky label="우리의 시간" value={r.closing.time}>
            <svg {...stroke} width={22} height={22} stroke="#C2255C">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </Lucky>
        </div>
        <P className="text-[#6B4A2B]">
          <Rich text={r.closing.tip} />
        </P>
      </Sec>
    </>
  );
}
