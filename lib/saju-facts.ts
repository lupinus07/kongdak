import { calcSaju, upcomingMonths, type Element, type Pillar, type Saju, type SajuInput } from "./saju";

/**
 * AI 풀이에 넘기는 "사실" 묶음. 간지·십성·합충은 전부 여기서 계산하고, AI는 이 값을 해석해 문장만 쓴다.
 * AI가 간지를 직접 계산하면 틀릴 수 있어서, 프롬프트에는 이 JSON에 없는 사주 정보를 쓰지 말라고 한다.
 */

const GAN = "甲乙丙丁戊己庚辛壬癸";
const ZHI = "子丑寅卯辰巳午未申酉戌亥";
const GAN_KO = ["갑목", "을목", "병화", "정화", "무토", "기토", "경금", "신금", "임수", "계수"];
const ZHI_KO = ["자수", "축토", "인목", "묘목", "진토", "사화", "오화", "미토", "신금", "유금", "술토", "해수"];
const GAN_EL: Element[] = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];
const ZHI_EL: Element[] = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"];
/** 지지 본기 천간 (십성 계산용) */
const ZHI_MAIN_GAN = "癸己甲乙戊丙丁己庚辛戊壬";

const EL_KO: Record<Element, string> = { wood: "목(나무)", fire: "화(불)", earth: "토(흙)", metal: "금(쇠)", water: "수(물)" };
/** 상생: key가 value를 생한다 */
const GENERATES: Record<Element, Element> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
/** 상극: key가 value를 극한다 */
const CONTROLS: Record<Element, Element> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };

const DAY_MASTER_IMAGE = [
  "큰 나무", "풀꽃·덩굴", "태양", "촛불·등불", "큰 산", "논밭의 흙", "바위·쇠", "보석", "큰 강·바다", "이슬비",
];

const SEASON: Record<string, string> = {
  寅: "초봄", 卯: "한봄", 辰: "늦봄", 巳: "초여름", 午: "한여름", 未: "늦여름",
  申: "초가을", 酉: "한가을", 戌: "늦가을", 亥: "초겨울", 子: "한겨울", 丑: "늦겨울",
};

const CLASH = [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]];
const COMBINE = [["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"]];
const TRIPLES: { zhi: string; name: string }[] = [
  { zhi: "申子辰", name: "수국(水局)" },
  { zhi: "亥卯未", name: "목국(木局)" },
  { zhi: "寅午戌", name: "화국(火局)" },
  { zhi: "巳酉丑", name: "금국(金局)" },
];
const STEM_COMBINE = [["甲", "己"], ["乙", "庚"], ["丙", "辛"], ["丁", "壬"], ["戊", "癸"]];

const POS_KO: Record<Pillar["key"], string> = { year: "년", month: "월", day: "일", hour: "시" };

/** 운에서 부족한 오행을 채울 때 쓸 행운 후보. AI는 이 중에서 고른다. */
const LUCKY: Record<Element, { color: string[]; direction: string; time: string }> = {
  wood: { color: ["초록", "연두"], direction: "동쪽", time: "이른 아침(5~7시)" },
  fire: { color: ["빨강", "코랄"], direction: "남쪽", time: "한낮(11~13시)" },
  earth: { color: ["노랑", "베이지"], direction: "남서쪽·북동쪽", time: "오후(13~17시)" },
  metal: { color: ["흰색", "은색"], direction: "서쪽", time: "저녁(17~19시)" },
  water: { color: ["검정", "남색"], direction: "북쪽", time: "밤(21~23시)" },
};

const isPair = (table: string[][], a: string, b: string) =>
  table.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 일간 기준 십성. 같은 오행이면 음양이 같을 때 비견, 다르면 겁재 같은 식으로 구한다. */
export function tenGod(dayGan: string, gan: string): string {
  const d = GAN.indexOf(dayGan);
  const g = GAN.indexOf(gan);
  const same = d % 2 === g % 2;
  const de = GAN_EL[d];
  const ge = GAN_EL[g];
  if (de === ge) return same ? "비견" : "겁재";
  if (GENERATES[de] === ge) return same ? "식신" : "상관";
  if (CONTROLS[de] === ge) return same ? "편재" : "정재";
  if (CONTROLS[ge] === de) return same ? "편관" : "정관";
  return same ? "편인" : "정인"; // GENERATES[ge] === de
}

type Spot = { pos: string; char: string };

/** 원국 안의 지지·천간 관계 (충, 육합, 삼합, 천간합) */
function natalRelations(saju: Saju): string[] {
  const out: string[] = [];
  const zs: Spot[] = saju.pillars.map((p) => ({ pos: POS_KO[p.key], char: p.zhi }));
  const gs: Spot[] = saju.pillars.map((p) => ({ pos: POS_KO[p.key], char: p.gan }));
  for (let i = 0; i < zs.length; i++) {
    for (let j = i + 1; j < zs.length; j++) {
      const [a, b] = [zs[i], zs[j]];
      if (isPair(CLASH, a.char, b.char)) out.push(`${a.pos}지 ${a.char}·${b.pos}지 ${b.char} 충`);
      if (isPair(COMBINE, a.char, b.char)) out.push(`${a.pos}지 ${a.char}·${b.pos}지 ${b.char} 육합`);
      if (isPair(STEM_COMBINE, gs[i].char, gs[j].char))
        out.push(`${gs[i].pos}간 ${gs[i].char}·${gs[j].pos}간 ${gs[j].char} 합`);
    }
  }
  const have = new Set(zs.map((z) => z.char));
  for (const t of TRIPLES) {
    const hit = [...t.zhi].filter((c) => have.has(c));
    if (hit.length === 3) out.push(`${t.zhi} ${t.name} 완성`);
    else if (hit.length === 2) out.push(`${hit.join("")} ${t.name} 반합(${[...t.zhi].find((c) => !have.has(c))} 빠짐)`);
  }
  return out;
}

/** 그 달의 간지가 원국과 만드는 관계 */
function monthRelations(saju: Saju, ganzhi: string): string[] {
  const [mg, mz] = [...ganzhi];
  const out: string[] = [];
  const day = saju.pillars.find((p) => p.key === "day")!;
  if (isPair(STEM_COMBINE, mg, day.gan)) out.push(`월간 ${mg}·일간 ${day.gan} 합`);
  for (const p of saju.pillars) {
    if (isPair(CLASH, mz, p.zhi)) out.push(`월지 ${mz}·${POS_KO[p.key]}지 ${p.zhi} 충`);
    if (isPair(COMBINE, mz, p.zhi)) out.push(`월지 ${mz}·${POS_KO[p.key]}지 ${p.zhi} 육합`);
  }
  const have = new Set(saju.pillars.map((p) => p.zhi));
  for (const t of TRIPLES) {
    if (!t.zhi.includes(mz)) continue;
    const others = [...t.zhi].filter((c) => c !== mz);
    const found = others.filter((c) => have.has(c));
    if (found.length === 2) out.push(`${t.zhi} ${t.name} 완성`);
    else if (found.length === 1 && have.has(found[0])) out.push(`${mz}${found[0]} ${t.name} 반합`);
  }
  return out;
}

export type LoveFacts = ReturnType<typeof buildLoveFacts>;

export function buildLoveFacts(
  input: SajuInput & { situation: string; gender: string; worry?: string },
  now = new Date(),
) {
  const saju = calcSaju(input);
  const day = saju.pillars.find((p) => p.key === "day")!;
  const month = saju.pillars.find((p) => p.key === "month")!;
  const dayIdx = GAN.indexOf(day.gan);

  const els = Object.keys(saju.balance) as Element[];
  const missing = els.filter((e) => saju.balance[e] === 0);
  const sorted = [...els].sort((a, b) => saju.balance[b] - saju.balance[a]);
  const strongest = sorted.filter((e) => saju.balance[e] === saju.balance[sorted[0]]);
  // 일간을 돕는 기운(비겁·인성)과 빼는 기운(식상·재성·관성)의 개수. 신강·신약을 대략 가늠하는 참고값이다.
  const helpers = els.filter((e) => e === day.ganEl || GENERATES[e] === day.ganEl);
  const support = helpers.reduce((n, e) => n + saju.balance[e], 0);
  const total = Object.values(saju.balance).reduce((a, b) => a + b, 0);

  const tenCount: Record<string, number> = {};
  const add = (t: string) => (tenCount[t] = (tenCount[t] ?? 0) + 1);
  for (const p of saju.pillars) {
    if (p.key !== "day") add(p.ganTen);
    add(p.zhiTen);
  }

  const partnerNames = input.gender === "남자" ? ["정재", "편재"] : ["정관", "편관"];
  const partnerPositions: string[] = [];
  for (const p of saju.pillars) {
    if (p.key !== "day" && partnerNames.includes(p.ganTen)) partnerPositions.push(`${POS_KO[p.key]}간 ${p.ganTen}`);
    if (partnerNames.includes(p.zhiTen)) partnerPositions.push(`${POS_KO[p.key]}지 ${p.zhiTen}`);
  }
  const partnerKinds = new Set(partnerPositions.map((s) => s.split(" ")[1]));

  const need = (missing.length ? missing : [sorted[sorted.length - 1]]).map((e) => ({
    element: EL_KO[e],
    lucky: LUCKY[e],
  }));

  const months = upcomingMonths(now).map((m) => {
    const [mg, mz] = [...m.ganzhi];
    const gi = GAN.indexOf(mg);
    const zi = ZHI.indexOf(mz);
    return {
      month: `${String(m.year).slice(2)}.${m.month}`,
      ganzhi: m.ganzhi,
      gan: { char: mg, ko: GAN_KO[gi], element: EL_KO[GAN_EL[gi]], tenGod: tenGod(day.gan, mg) },
      zhi: { char: mz, ko: ZHI_KO[zi], element: EL_KO[ZHI_EL[zi]], tenGod: tenGod(day.gan, ZHI_MAIN_GAN[zi]) },
      relations: monthRelations(saju, m.ganzhi),
      fillsMissingElement: missing.some((e) => e === GAN_EL[gi] || e === ZHI_EL[zi]),
    };
  });

  return {
    profile: {
      situation: input.situation,
      gender: input.gender,
      birthTimeKnown: input.time !== "",
      worry: input.worry?.trim() || null,
    },
    pillars: saju.pillars.map((p) => ({
      position: POS_KO[p.key] + "주",
      gan: `${p.gan}(${p.ganRead})`,
      zhi: `${p.zhi}(${p.zhiRead})`,
      ganTenGod: p.ganTen,
      zhiTenGod: p.zhiTen,
    })),
    dayMaster: { gan: day.gan, ko: day.ganRead, image: DAY_MASTER_IMAGE[dayIdx], element: EL_KO[day.ganEl] },
    monthBranch: { zhi: month.zhi, season: SEASON[month.zhi], element: EL_KO[month.zhiEl] },
    elementCount: Object.fromEntries(els.map((e) => [EL_KO[e], saju.balance[e]])),
    strongestElements: strongest.map((e) => EL_KO[e]),
    missingElements: missing.map((e) => EL_KO[e]),
    selfSupport: { supportingCount: support, total, note: "일간과 같은 오행 + 일간을 생하는 오행의 글자 수 (참고용)" },
    tenGodCount: tenCount,
    partnerStar: {
      kind: input.gender === "남자" ? "재성(정재·편재)" : "관성(정관·편관)",
      count: partnerPositions.length,
      positions: partnerPositions,
      mixed: partnerKinds.size > 1,
    },
    spousePalace: { zhi: day.zhi, tenGod: day.zhiTen },
    natalRelations: natalRelations(saju),
    neededElements: need,
    months,
  };
}
