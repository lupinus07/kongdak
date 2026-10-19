import { Lunar, Solar } from "lunar-javascript";

/** 사주 원국 계산. 만세력 라이브러리(절기 기준)로 계산하며 AI는 쓰지 않는다. 시각 보정(지역·서머타임)은 하지 않는다. */

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type Pillar = {
  key: "hour" | "day" | "month" | "year";
  gan: string;
  zhi: string;
  ganEl: Element;
  zhiEl: Element;
  ganRead: string;
  zhiRead: string;
  /** 천간 십성. 일주는 "일간" */
  ganTen: string;
  /** 지지 십성(본기 기준) */
  zhiTen: string;
};
export type Saju = {
  /** 시간을 모르면 hour 기둥이 빠진다 */
  pillars: Pillar[];
  dayMaster: { gan: string; element: Element };
  balance: Record<Element, number>;
};
export type SajuInput = {
  birth: string; // YYYY.MM.DD
  calendar: string; // "양력" | "음력"
  /** 12시진 번호 "0"(자시)~"11"(해시), 모르면 "" */
  time: string;
  leapMonth?: boolean;
};

const GAN = "甲乙丙丁戊己庚辛壬癸";
const ZHI = "子丑寅卯辰巳午未申酉戌亥";
const GAN_READ = ["갑목", "을목", "병화", "정화", "무토", "기토", "경금", "신금", "임수", "계수"];
const ZHI_READ = ["자수", "축토", "인목", "묘목", "진토", "사화", "오화", "미토", "신금", "유금", "술토", "해수"];
const GAN_EL: Element[] = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];
const ZHI_EL: Element[] = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"];

const TEN: Record<string, string> = {
  比肩: "비견", 劫财: "겁재", 食神: "식신", 伤官: "상관", 偏财: "편재",
  正财: "정재", 七杀: "편관", 正官: "정관", 偏印: "편인", 正印: "정인",
};

function pillar(
  key: Pillar["key"],
  gan: string,
  zhi: string,
  ganTen: string,
  zhiTen: string[],
): Pillar {
  const g = GAN.indexOf(gan);
  const z = ZHI.indexOf(zhi);
  return {
    key,
    gan,
    zhi,
    ganEl: GAN_EL[g],
    zhiEl: ZHI_EL[z],
    ganRead: GAN_READ[g],
    zhiRead: ZHI_READ[z],
    ganTen: TEN[ganTen] ?? ganTen,
    zhiTen: TEN[zhiTen[0]] ?? zhiTen[0],
  };
}

/** 시진 번호 → 대표 시각. 자시(23:30~01:29)는 0시로 보아 그날의 시주로 쓴다. */
function hourOf(time: string): number {
  return time === "" ? 12 : Number(time) * 2;
}

export function calcSaju({ birth, calendar, time, leapMonth }: SajuInput): Saju {
  const [y, m, d] = birth.split(".").map(Number);
  const h = hourOf(time);
  const lunar =
    calendar === "음력"
      ? Lunar.fromYmdHms(y, leapMonth ? -m : m, d, h, 0, 0)
      : Solar.fromYmdHms(y, m, d, h, 0, 0).getLunar();
  const ec = lunar.getEightChar();

  const pillars: Pillar[] = [];
  if (time !== "") {
    pillars.push(pillar("hour", ec.getTimeGan(), ec.getTimeZhi(), ec.getTimeShiShenGan(), ec.getTimeShiShenZhi()));
  }
  pillars.push(pillar("day", ec.getDayGan(), ec.getDayZhi(), "日主", ec.getDayShiShenZhi()));
  pillars[pillars.length - 1].ganTen = "일간";
  pillars.push(pillar("month", ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthShiShenGan(), ec.getMonthShiShenZhi()));
  pillars.push(pillar("year", ec.getYearGan(), ec.getYearZhi(), ec.getYearShiShenGan(), ec.getYearShiShenZhi()));

  const balance: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const p of pillars) {
    balance[p.ganEl] += 1;
    balance[p.zhiEl] += 1;
  }
  const day = pillars.find((p) => p.key === "day")!;
  return { pillars, dayMaster: { gan: day.gan, element: day.ganEl }, balance };
}

/** 다가오는 12개월의 월주(절기 기준). 달 중순(15일)의 월주를 그 달의 월주로 쓴다. */
export function upcomingMonths(from = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth() + i, 15);
    const ec = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, 15, 12, 0, 0).getLunar().getEightChar();
    return { year: date.getFullYear(), month: date.getMonth() + 1, ganzhi: ec.getMonth() };
  });
}
