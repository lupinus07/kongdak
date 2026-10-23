import { after } from "next/server";
import { checkBirthDate } from "./birth";
import { generateLoveReading, LoveReadingStoredSchema, type LoveReading } from "./love-reading";
import { buildLoveFacts } from "./saju-facts";
import { calcSaju, type Saju } from "./saju";
import { createAdminClient } from "./supabase/admin";

/**
 * 나의 연애운 AI 풀이를 처음 열 때 만들고 readings에 저장한다(환불 시 API 비용 절약).
 * 만드는 일은 응답이 끝난 뒤(after)에 서버에서 이어가서, 탭을 닫아도 풀이는 끝까지 만들어진다.
 * 이미 저장돼 있으면 API를 다시 부르지 않는다. 생성에 실패하면 opened_at을 남기지 않아 환불 기준이 어긋나지 않는다.
 */

type LoveInput = { birth?: string; calendar?: string; time?: string; situation?: string; gender?: string; worry?: string };

export type LoveReadingResult =
  | { ok: true; saju: Saju; reading: LoveReading; input: LoveInput }
  | { ok: false; reason: "no-birth" }
  | { ok: false; reason: "pending"; saju: Saju };

/** 이 시간이 지나도 풀이가 없으면 생성이 끊긴 것으로 보고 다시 시도할 수 있게 한다. 실패 직후 재시도 폭주도 막는다. */
const LOCK_MS = 3 * 60 * 1000;

export async function openLoveReading(orderId: string, input: LoveInput): Promise<LoveReadingResult> {
  if (!input.birth || checkBirthDate(input.birth) !== "ok") return { ok: false, reason: "no-birth" };
  const sajuInput = { birth: input.birth, calendar: input.calendar ?? "양력", time: input.time ?? "" };
  const saju = calcSaju(sajuInput);

  const admin = createAdminClient();
  const { data: row } = await admin.from("readings").select("result, opened_at").eq("order_id", orderId).maybeSingle();

  const stored = LoveReadingStoredSchema.safeParse(row?.result);
  if (stored.success) {
    if (!row?.opened_at) await admin.from("readings").update({ opened_at: new Date().toISOString() }).eq("order_id", orderId);
    return { ok: true, saju, reading: stored.data, input };
  }

  // 한 요청만 생성을 맡는다(새로고침·폴링이 겹쳐도 API를 한 번만 부른다).
  const now = Date.now();
  const { data: claimed } = await admin
    .from("readings")
    .update({ generating_at: new Date(now).toISOString() })
    .eq("order_id", orderId)
    .is("result", null)
    .or(`generating_at.is.null,generating_at.lt.${new Date(now - LOCK_MS).toISOString()}`)
    .select("id");

  if (claimed?.length) {
    after(async () => {
      try {
        const facts = buildLoveFacts({
          ...sajuInput,
          situation: input.situation ?? "솔로",
          gender: input.gender ?? "",
          worry: input.worry,
        });
        const { reading, usage } = await generateLoveReading(facts);
        // 건당 API 비용 파악용. 출력 토큰에는 생각(thinking) 토큰이 포함된다.
        console.log("연애운 풀이 생성", { orderId, input: usage.input_tokens, output: usage.output_tokens });
        await admin
          .from("readings")
          .update({ saju, result: reading, opened_at: new Date().toISOString(), generating_at: null })
          .eq("order_id", orderId);
      } catch (e) {
        // generating_at을 남겨 둔다. LOCK_MS가 지나기 전에는 다시 시도하지 않는다.
        console.error("연애운 풀이 생성 실패", orderId, e instanceof Error ? e.message : e);
      }
    });
  }

  return { ok: false, reason: "pending", saju };
}
