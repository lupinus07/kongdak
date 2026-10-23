import type { Product } from "./products";
import { createAdminClient } from "./supabase/admin";

/** 관리자 대시보드 집계. service_role로 orders·readings를 읽어 서버에서만 계산한다(보기 전용). */

type Status = "READY" | "DONE" | "CANCELED" | "REFUNDED" | "FAILED";

type Row = {
  product_code: Product;
  amount: number;
  status: Status;
  method: string | null;
  approved_at: string | null;
  created_at: string;
  order_code: string;
  user_id: string | null;
  readings: { opened_at: string | null } | { opened_at: string | null }[] | null;
};

export type RecentOrder = {
  orderCode: string;
  product: Product;
  amount: number;
  status: Status;
  method: string;
  at: string; // ISO
  opened: boolean;
  member: boolean;
};

export type AdminStats = {
  generatedAt: string;
  truncated: boolean;
  revenue: { today: number; days7: number; days30: number; total: number };
  counts: Record<Status, number>;
  byProduct: Record<Product, { count: number; revenue: number }>;
  openedRate: number | null; // 결제 완료 주문 중 풀이를 연 비율
  refundable: { count: number; amount: number }; // 풀이를 안 열고 7일 안이라 환불될 수 있는 금액
  completionRate30: number | null; // 최근 30일 주문 생성 대비 결제 완료
  memberShare: number | null; // 결제 완료 주문 중 회원 비율
  daily: { date: string; count: number; revenue: number }[]; // 최근 14일, 오래된 날부터
  recent: RecentOrder[];
};

const LIMIT = 5000;
const KST = 9 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 날짜 키 (YYYY-MM-DD) */
function kstDay(ms: number) {
  return new Date(ms + KST).toISOString().slice(0, 10);
}

function methodLabel(method: string | null) {
  if (!method) return "-";
  if (method === "CARD") return "카드";
  if (method.startsWith("EASY_PAY:")) {
    const legacy: Record<string, string> = { KAKAOPAY: "카카오페이", NAVERPAY: "네이버페이", TOSSPAY: "토스페이" };
    const p = method.slice(9);
    return legacy[p] ?? (p === "UNKNOWN" ? "간편결제" : p);
  }
  return method;
}

function isOpened(r: Row) {
  const reading = Array.isArray(r.readings) ? r.readings[0] : r.readings;
  return !!reading?.opened_at;
}

export async function loadAdminStats(now = Date.now()): Promise<AdminStats> {
  const { data } = await createAdminClient()
    .from("orders")
    .select("product_code, amount, status, method, approved_at, created_at, order_code, user_id, readings(opened_at)")
    .order("created_at", { ascending: false })
    .limit(LIMIT)
    .returns<Row[]>();
  const rows = data ?? [];

  const counts: AdminStats["counts"] = { READY: 0, DONE: 0, CANCELED: 0, REFUNDED: 0, FAILED: 0 };
  const byProduct: AdminStats["byProduct"] = {
    compat: { count: 0, revenue: 0 },
    love: { count: 0, revenue: 0 },
  };
  const revenue = { today: 0, days7: 0, days30: 0, total: 0 };
  const todayKey = kstDay(now);
  const dailyMap = new Map<string, { count: number; revenue: number }>();
  for (let i = 13; i >= 0; i--) dailyMap.set(kstDay(now - i * DAY), { count: 0, revenue: 0 });

  let done = 0;
  let opened = 0;
  let members = 0;
  let created30 = 0;
  let done30 = 0;
  const refundable = { count: 0, amount: 0 };

  for (const r of rows) {
    counts[r.status] += 1;
    const createdMs = new Date(r.created_at).getTime();
    if (now - createdMs <= 30 * DAY) {
      created30 += 1;
      if (r.status === "DONE") done30 += 1;
    }
    if (r.status !== "DONE") continue;

    done += 1;
    if (r.user_id) members += 1;
    if (isOpened(r)) opened += 1;
    byProduct[r.product_code].count += 1;
    byProduct[r.product_code].revenue += r.amount;

    const paidMs = new Date(r.approved_at ?? r.created_at).getTime();
    revenue.total += r.amount;
    if (now - paidMs <= 30 * DAY) revenue.days30 += r.amount;
    if (now - paidMs <= 7 * DAY) revenue.days7 += r.amount;
    const key = kstDay(paidMs);
    if (key === todayKey) revenue.today += r.amount;
    const day = dailyMap.get(key);
    if (day) {
      day.count += 1;
      day.revenue += r.amount;
    }
    if (!isOpened(r) && now - paidMs <= 7 * DAY) {
      refundable.count += 1;
      refundable.amount += r.amount;
    }
  }

  return {
    generatedAt: new Date(now).toISOString(),
    truncated: rows.length >= LIMIT,
    revenue,
    counts,
    byProduct,
    openedRate: done ? opened / done : null,
    refundable,
    completionRate30: created30 ? done30 / created30 : null,
    memberShare: done ? members / done : null,
    daily: [...dailyMap].map(([date, v]) => ({ date, ...v })),
    recent: rows
      .filter((r) => r.status !== "READY")
      .slice(0, 20)
      .map((r) => ({
        orderCode: r.order_code,
        product: r.product_code,
        amount: r.amount,
        status: r.status,
        method: methodLabel(r.method),
        at: r.approved_at ?? r.created_at,
        opened: isOpened(r),
        member: !!r.user_id,
      })),
  };
}
