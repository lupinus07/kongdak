import { checkBirthDate } from "./birth";
import { generateLoveReading, LoveReadingStoredSchema, type LoveReading } from "./love-reading";
import { openStoredReading } from "./reading-server";
import { buildLoveFacts } from "./saju-facts";
import { calcSaju, type Saju } from "./saju";

/** 나의 연애운 AI 풀이를 처음 열 때 만들고 readings에 저장한다(생성·잠금은 reading-server.ts 공통). */

type LoveInput = { birth?: string; calendar?: string; time?: string; situation?: string; gender?: string; worry?: string };

export type LoveReadingResult =
  | { ok: true; saju: Saju; reading: LoveReading; input: LoveInput }
  | { ok: false; reason: "no-birth" }
  | { ok: false; reason: "pending"; saju: Saju };

export async function openLoveReading(orderId: string, input: LoveInput): Promise<LoveReadingResult> {
  if (!input.birth || checkBirthDate(input.birth) !== "ok") return { ok: false, reason: "no-birth" };
  const sajuInput = { birth: input.birth, calendar: input.calendar ?? "양력", time: input.time ?? "" };
  const saju = calcSaju(sajuInput);

  const res = await openStoredReading({
    orderId,
    schema: LoveReadingStoredSchema,
    saju,
    label: "연애운 풀이",
    generate: () =>
      generateLoveReading(
        buildLoveFacts({ ...sajuInput, situation: input.situation ?? "솔로", gender: input.gender ?? "", worry: input.worry }),
      ),
  });
  return res.ok ? { ok: true, saju, reading: res.reading, input } : { ok: false, reason: "pending", saju };
}
