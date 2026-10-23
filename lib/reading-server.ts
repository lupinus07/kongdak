import { after } from "next/server";
import type { z } from "zod";
import { createAdminClient } from "./supabase/admin";

/**
 * 유료 AI 풀이를 처음 열 때 만들고 readings에 저장한다(환불 시 API 비용 절약). 연애운·궁합 공통.
 * 만드는 일은 응답이 끝난 뒤(after)에 서버에서 이어가서, 탭을 닫아도 풀이는 끝까지 만들어진다.
 * 이미 저장돼 있으면 API를 다시 부르지 않는다. 생성에 실패하면 opened_at을 남기지 않아 환불 기준이 어긋나지 않는다.
 */

/** 이 시간이 지나도 풀이가 없으면 생성이 끊긴 것으로 보고 다시 시도할 수 있게 한다. 실패 직후 재시도 폭주도 막는다. */
const LOCK_MS = 3 * 60 * 1000;

export async function openStoredReading<T>({
  orderId,
  schema,
  saju,
  generate,
  label,
}: {
  orderId: string;
  /** 저장된 풀이를 읽을 때 쓰는 스키마 */
  schema: z.ZodType<T>;
  /** readings.saju에 함께 남기는 원국 */
  saju: unknown;
  generate: () => Promise<{ reading: T; usage: { input_tokens: number; output_tokens: number } }>;
  /** 로그용 이름 */
  label: string;
}): Promise<{ ok: true; reading: T } | { ok: false }> {
  const admin = createAdminClient();
  const { data: row } = await admin.from("readings").select("result, opened_at").eq("order_id", orderId).maybeSingle();

  const stored = schema.safeParse(row?.result);
  if (stored.success) {
    if (!row?.opened_at) await admin.from("readings").update({ opened_at: new Date().toISOString() }).eq("order_id", orderId);
    return { ok: true, reading: stored.data };
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
        const { reading, usage } = await generate();
        // 건당 API 비용 파악용. 출력 토큰에는 생각(thinking) 토큰이 포함된다.
        console.log(`${label} 생성`, { orderId, input: usage.input_tokens, output: usage.output_tokens });
        await admin
          .from("readings")
          .update({ saju, result: reading, opened_at: new Date().toISOString(), generating_at: null })
          .eq("order_id", orderId);
      } catch (e) {
        // generating_at을 남겨 둔다. LOCK_MS가 지나기 전에는 다시 시도하지 않는다.
        console.error(`${label} 생성 실패`, orderId, e instanceof Error ? e.message : e);
      }
    });
  }
  return { ok: false };
}
