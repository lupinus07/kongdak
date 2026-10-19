import { calcSaju, upcomingMonths } from "./saju";

// 샘플 풀이의 사주(1988.12.07 자시): 戊辰 癸亥 丙申 戊子, 일간 병화
const s = calcSaju({ birth: "1988.12.07", calendar: "양력", time: "0" });
console.log(s.pillars.map((p) => `${p.key} ${p.gan}${p.zhi} ${p.ganTen}/${p.zhiTen}`).join("\n"));
console.log(s.balance);
console.log(calcSaju({ birth: "1988.12.07", calendar: "양력", time: "" }).pillars.length, "기둥(시간 모름)");
console.log(upcomingMonths(new Date(2026, 10, 1)).map((m) => `${m.year}.${m.month} ${m.ganzhi}`).join(", "));
