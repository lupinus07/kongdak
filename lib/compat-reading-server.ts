import { checkBirthDate } from "./birth";
import { CompatReadingSchema, generateCompatReading, type CompatReading } from "./compat-reading";
import { openStoredReading } from "./reading-server";
import { buildCompatFacts } from "./saju-facts";
import { calcSaju, type Saju } from "./saju";

/** 둘의 궁합 AI 풀이를 처음 열 때 만들고 readings에 저장한다(생성·잠금은 reading-server.ts 공통). */

type Person = { birth?: string; time?: string; gender?: string };
export type CompatInput = { relation?: string; me?: Person; you?: Person };

/** 풀이와 화면에서 두 사람을 부르는 이름. 부부면 아내·남편, 아니면 나·그 사람. */
export function compatLabels(relation: string | undefined, meGender = "", youGender = ""): [string, string] {
  if (relation === "부부" && meGender !== youGender) {
    const role = (g: string) => (g === "남자" ? "남편" : "아내");
    return [role(meGender), role(youGender)];
  }
  return ["나", "그 사람"];
}

export type CompatSide = { label: string; saju: Saju; birth: string; time: string; gender: string };

export type CompatReadingResult =
  | { ok: true; me: CompatSide; you: CompatSide; reading: CompatReading; score: number; relation: string }
  | { ok: false; reason: "no-birth" }
  | { ok: false; reason: "pending"; me: CompatSide; you: CompatSide };

export async function openCompatReading(orderId: string, input: CompatInput): Promise<CompatReadingResult> {
  const { me, you } = input;
  if (!me?.birth || !you?.birth || checkBirthDate(me.birth) !== "ok" || checkBirthDate(you.birth) !== "ok") {
    return { ok: false, reason: "no-birth" };
  }
  const relation = input.relation ?? "연애 중";
  const [la, lb] = compatLabels(relation, me.gender, you.gender);
  // 궁합 입력은 양력만 받는다
  const side = (p: Person, label: string): CompatSide => ({
    label,
    birth: p.birth!,
    time: p.time ?? "",
    gender: p.gender ?? "",
    saju: calcSaju({ birth: p.birth!, calendar: "양력", time: p.time ?? "" }),
  });
  const [a, b] = [side(me, la), side(you, lb)];
  const facts = buildCompatFacts(
    { birth: a.birth, calendar: "양력", time: a.time, gender: a.gender, label: la },
    { birth: b.birth, calendar: "양력", time: b.time, gender: b.gender, label: lb },
    relation,
  );

  const res = await openStoredReading({
    orderId,
    schema: CompatReadingSchema,
    saju: { me: a.saju, you: b.saju },
    label: "궁합 풀이",
    generate: () => generateCompatReading(facts),
  });
  return res.ok
    ? { ok: true, me: a, you: b, reading: res.reading, score: facts.score, relation }
    : { ok: false, reason: "pending", me: a, you: b };
}
