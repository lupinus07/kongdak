"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPrompt } from "@/components/LoginPrompt";
import { useSession } from "@/lib/session";
import { MOCK_ORDERS, MOCK_READINGS, refundDeadline } from "@/lib/mock-my";
import { loadMyReadings, type SavedReading } from "@/lib/my-readings";
import { PRODUCTS } from "@/lib/products";

type Tab = "orders" | "readings";
const TABS: { id: Tab; label: string }[] = [
  { id: "orders", label: "결제 내역" },
  { id: "readings", label: "내 풀이 기록" },
];

const card = "flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.08)]";

function Badge({ children, tone }: { children: React.ReactNode; tone: "pink" | "gray" | "yellow" }) {
  const cls = {
    pink: "bg-[#FFE3EC] text-[#A61E4D]",
    gray: "bg-[#F1ECEE] text-[#7A5566]",
    yellow: "bg-[#FFF7D6] text-[#8A5A00]",
  }[tone];
  return <span className={`rounded-lg px-2 py-[3px] text-xs ${cls}`}>{children}</span>;
}

function Orders() {
  return (
    <div className="flex flex-col gap-3">
      {MOCK_ORDERS.map((o) => {
        const until = refundDeadline(o.paidAt, o.opened);
        return (
          <div key={o.id} className={card}>
            <div className="flex items-center justify-between">
              <span className="font-title text-base">{PRODUCTS[o.product].name}</span>
              <span className="font-title text-base text-brand">{o.amount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-ink-sub">{o.paidAt.replaceAll("-", ".")} 결제</span>
              <Badge tone={o.opened ? "gray" : "pink"}>{o.opened ? "풀이 열람함" : "아직 안 열어봤어요"}</Badge>
            </div>
            {until && <p className="m-0 text-xs text-ink-sub">풀이를 열기 전이라면 {until}까지 환불할 수 있어요</p>}
          </div>
        );
      })}
      <p className="m-0 px-1 text-xs leading-relaxed text-ink-mute">
        풀이를 열기 전에는 결제일로부터 7일 이내 전액 환불돼요. 풀이를 연 뒤에는 서비스 오류가 아니면 환불이 어려워요.
      </p>
    </div>
  );
}

function Readings() {
  return (
    <div className="flex flex-col gap-3">
      {MOCK_READINGS.map((r) => (
        <Link
          key={r.id}
          href={`${PRODUCTS[r.product].resultHref}?id=${r.id}`}
          className={`${card} text-ink no-underline`}
        >
          <div className="flex items-center justify-between">
            <span className="font-title text-base">{r.product === "love" ? "나의 연애운" : "둘의 궁합"}</span>
            {r.opened ? <Badge tone="gray">다시 보기 ›</Badge> : <Badge tone="yellow">열어보기 ›</Badge>}
          </div>
          <span className="text-[13px] text-ink-sub">{r.summary}</span>
          <span className="text-xs text-ink-mute">{r.at}</span>
        </Link>
      ))}
    </div>
  );
}

/** 로그인 없이 결제한 풀이: 이 브라우저에 기억해 둔 결과 링크와, 잃어버렸을 때 다시 찾기 */
function GuestReadings() {
  const [list, setList] = useState<SavedReading[]>([]);
  useEffect(() => {
    // localStorage는 마운트 뒤에만 읽을 수 있다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(loadMyReadings());
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <span className="font-title text-lg">이 기기에서 결제한 풀이</span>
      {list.map((r) => (
        <Link key={r.token} href={`${PRODUCTS[r.product].resultHref}?t=${r.token}`} className={`${card} text-ink no-underline`}>
          <div className="flex items-center justify-between">
            <span className="font-title text-base">{PRODUCTS[r.product].name}</span>
            <Badge tone="pink">다시 보기 ›</Badge>
          </div>
          <span className="text-xs text-ink-mute">
            {r.orderCode ? `주문번호 ${r.orderCode} · ` : ""}
            {new Date(r.savedAt).toLocaleDateString("ko-KR")}
          </span>
        </Link>
      ))}
      {list.length === 0 && <p className="m-0 text-sm text-ink-sub">이 기기에서 결제한 풀이가 아직 없어요.</p>}
      <Link href="/find" className="self-start py-1 text-sm text-brand">
        다른 기기에서 결제했거나 링크를 잃어버렸나요? 주문번호로 찾기 ›
      </Link>
    </div>
  );
}

export function MyClient() {
  const { session, ready } = useSession();
  const paramTab = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>(paramTab === "readings" ? "readings" : "orders");

  if (!ready) return null;

  if (!session) {
    return (
      <>
        <GuestReadings />
        <div className="flex flex-1 flex-col justify-center">
          <LoginPrompt />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 font-title text-[26px] font-normal">{session.nickname} 님의 기록</h1>
        <p className="m-0 text-sm text-ink-sub">결제한 풀이는 언제든 다시 볼 수 있어요</p>
      </div>

      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-[14px] bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-10 rounded-[11px] text-sm ${tab === t.id ? "bg-bg font-title text-brand" : "text-ink-sub"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" ? <Orders /> : <Readings />}
    </>
  );
}
