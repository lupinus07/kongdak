import { checkBirthDate } from "./birth";
import { generateLoveReading, LoveReadingSchema, type LoveReading } from "./love-reading";
import { buildLoveFacts } from "./saju-facts";
import { calcSaju, type Saju } from "./saju";
import { createAdminClient } from "./supabase/admin";

/**
 * 나의 연애운 AI 풀이를 처음 열 때 만들고 readings에 저장한다(환불 시 API 비용 절약).
 * 이미 저장돼 있으면 API를 다시 부르지 않는다. 생성에 실패하면 opened_at을 남기지 않아 환불 기준이 어긋나지 않는다.
 */

type LoveInput = { birth?: string; calendar?: string; time?: string; situation?: string; gender?: string };

export type LoveReadingResult =
  | { ok: true; saju: Saju; reading: LoveReading; input: LoveInput }
  | { ok: false; reason: "no-birth" | "failed" };

export async function openLoveReading(orderId: string, input: LoveInput): Promise<LoveReadingResult> {
  if (!input.birth || checkBirthDate(input.birth) !== "ok") return { ok: false, reason: "no-birth" };
  const sajuInput = { birth: input.birth, calendar: input.calendar ?? "양력", time: input.time ?? "" };
  const saju = calcSaju(sajuInput);

  const admin = createAdminClient();
  const { data: row } = await admin.from("readings").select("result, opened_at").eq("order_id", orderId).maybeSingle();

  const stored = LoveReadingSchema.safeParse(row?.result);
  if (stored.success) {
    if (!row?.opened_at) await admin.from("readings").update({ opened_at: new Date().toISOString() }).eq("order_id", orderId);
    return { ok: true, saju, reading: stored.data, input };
  }

  try {
    const facts = buildLoveFacts({ ...sajuInput, situation: input.situation ?? "솔로", gender: input.gender ?? "" });
    const { reading, usage } = await generateLoveReading(facts);
    // 건당 API 비용 파악용. 출력 토큰에는 생각(thinking) 토큰이 포함된다.
    console.log("연애운 풀이 생성", { orderId, input: usage.input_tokens, output: usage.output_tokens });
    await admin
      .from("readings")
      .update({ saju, result: reading, opened_at: row?.opened_at ?? new Date().toISOString() })
      .eq("order_id", orderId);
    return { ok: true, saju, reading, input };
  } catch (e) {
    console.error("연애운 풀이 생성 실패", orderId, e instanceof Error ? e.message : e);
    return { ok: false, reason: "failed" };
  }
}
