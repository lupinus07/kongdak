import type { ReactNode } from "react";
import { PRODUCTS } from "@/lib/products";
import type { AdminInquiry } from "@/lib/admin-inquiries";
import type { AdminStats, RecentOrder } from "@/lib/admin-stats";
import { AnswerForm } from "./AnswerForm";
import { logoutAction } from "./actions";

const won = (n: number) => `${n.toLocaleString()}원`;
const pct = (v: number | null) => (v === null ? "-" : `${Math.round(v * 100)}%`);

const STATUS: Record<RecentOrder["status"], { label: string; cls: string }> = {
  DONE: { label: "결제 완료", cls: "bg-[#E3F4E1] text-[#2B6B2A]" },
  REFUNDED: { label: "환불됨", cls: "bg-[#FFF1DE] text-[#8A4B00]" },
  CANCELED: { label: "결제 취소", cls: "bg-[#ECEEF1] text-[#495057]" },
  FAILED: { label: "실패", cls: "bg-[#FFE4D6] text-[#B23A07]" },
  READY: { label: "결제 대기", cls: "bg-[#ECEEF1] text-[#495057]" },
};

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[22px] bg-white p-5">
      <h2 className="m-0 font-title text-[17px] font-normal text-brand">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-[#FFF8FA] px-4 py-3">
      <span className="text-[13.5px] text-ink-sub">{label}</span>
      <b className="font-title text-[22px] font-normal text-ink">{value}</b>
      {sub && <span className="text-[13px] text-ink-mute">{sub}</span>}
    </div>
  );
}

function formatAt(iso: string) {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

function InquiryItem({ q }: { q: AdminInquiry }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#FFF8FA] p-3.5">
      <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
        <span className="rounded-lg bg-[#FFE3EC] px-2 py-0.5 text-brand">{q.category}</span>
        <span className="font-mono text-ink-sub">문의 {q.code}</span>
        {q.orderCode && <span className="font-mono text-ink-sub">· 주문 {q.orderCode}</span>}
        <span className="ml-auto text-ink-mute">{formatAt(q.createdAt)}</span>
      </div>
      <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{q.content}</p>
      <AnswerForm id={q.id} answer={q.answer} />
    </div>
  );
}

export function Dashboard({ stats, inquiries }: { stats: AdminStats; inquiries: { open: AdminInquiry[]; answered: AdminInquiry[] } }) {
  const maxRevenue = Math.max(1, ...stats.daily.map((d) => d.revenue));
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="m-0 font-title text-[26px] font-normal text-ink">콩닥 대시보드</h1>
          <p className="m-0 text-[13.5px] text-ink-mute">
            {formatAt(stats.generatedAt)} 기준
            {stats.truncated && " · 주문이 많아 최근 5,000건만 집계했어요"}
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="rounded-2xl border border-[#F3C6D6] bg-white px-3.5 py-2 text-[14px] text-ink-sub">
            로그아웃
          </button>
        </form>
      </header>

      <Card title={`문의 · 답변 기다리는 중 ${inquiries.open.length}건`}>
        {inquiries.open.length ? (
          inquiries.open.map((q) => <InquiryItem key={q.id} q={q} />)
        ) : (
          <p className="m-0 text-[14px] text-ink-mute">새 문의가 없어요.</p>
        )}
        {inquiries.answered.length > 0 && (
          <details>
            <summary className="cursor-pointer text-[14px] text-ink-sub">최근 답변한 문의 {inquiries.answered.length}건</summary>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {inquiries.answered.map((q) => (
                <InquiryItem key={q.id} q={q} />
              ))}
            </div>
          </details>
        )}
        <p className="m-0 text-[13px] text-ink-mute">환불은 주문번호를 아래 최근 주문에서 확인하고, 토스 관리자 화면에서 취소해 주세요.</p>
      </Card>

      <Card title="매출 (결제 완료 기준, 환불 제외)">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="오늘" value={won(stats.revenue.today)} />
          <Stat label="최근 7일" value={won(stats.revenue.days7)} />
          <Stat label="최근 30일" value={won(stats.revenue.days30)} />
          <Stat label="전체" value={won(stats.revenue.total)} />
        </div>
      </Card>

      <Card title="최근 14일 (한국 시간)">
        <div className="flex h-36 items-end gap-1.5">
          {stats.daily.map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.date} ${won(d.revenue)}`}>
              <span className="text-[11.5px] text-ink-mute">{d.count || ""}</span>
              <div
                className="w-full rounded-t-md bg-point"
                style={{ height: `${Math.max(d.revenue ? 4 : 1, (d.revenue / maxRevenue) * 100)}%`, opacity: d.revenue ? 1 : 0.25 }}
              />
              <span className="text-[11.5px] text-ink-sub">{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="m-0 text-[13px] text-ink-mute">막대 높이는 매출, 위 숫자는 결제 건수예요.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="상품별 (결제 완료)">
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(PRODUCTS) as (keyof typeof PRODUCTS)[]).map((code) => (
              <Stat
                key={code}
                label={PRODUCTS[code].name}
                value={`${stats.byProduct[code].count}건`}
                sub={won(stats.byProduct[code].revenue)}
              />
            ))}
          </div>
        </Card>

        <Card title="지표">
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="풀이 열람률" value={pct(stats.openedRate)} sub="결제 완료 중 연 비율" />
            <Stat label="결제 완료율(30일)" value={pct(stats.completionRate30)} sub="주문 생성 대비" />
            <Stat label="회원 비율" value={pct(stats.memberShare)} sub="나머지는 비회원" />
            <Stat
              label="환불될 수 있는 금액"
              value={won(stats.refundable.amount)}
              sub={`${stats.refundable.count}건 · 안 열고 7일 이내`}
            />
          </div>
        </Card>
      </div>

      <Card title="주문 상태">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS) as RecentOrder["status"][]).map((s) => (
            <span key={s} className={`rounded-xl px-3 py-1.5 text-[14px] ${STATUS[s].cls}`}>
              {STATUS[s].label} {stats.counts[s]}
            </span>
          ))}
        </div>
        <p className="m-0 text-[13px] text-ink-mute">
          결제 대기는 결제창을 열고 끝내지 않은 주문이에요. 오래 남아 있어도 정상이에요.
        </p>
      </Card>

      <Card title="최근 주문 20건">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="text-ink-mute">
                {["주문번호", "상품", "금액", "상태", "결제수단", "구분", "풀이", "시각"].map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-[#F3C6D6] px-2 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o.orderCode + o.at} className="text-ink">
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2 font-mono">{o.orderCode}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">{PRODUCTS[o.product].name}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">{won(o.amount)}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[13px] ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
                  </td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">{o.method}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">{o.member ? "회원" : "비회원"}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2">{o.opened ? "열람" : "미열람"}</td>
                  <td className="whitespace-nowrap border-b border-[#FBE3EC] px-2 py-2 text-ink-sub">{formatAt(o.at)}</td>
                </tr>
              ))}
              {stats.recent.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-ink-mute">
                    아직 주문이 없어요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="m-0 text-[13px] text-ink-mute">
          주문번호로 환불 요청을 확인할 수 있어요. 결과 링크, 휴대폰 뒷자리, 생년월일 같은 개인정보는 보여주지 않아요.
        </p>
      </Card>
    </main>
  );
}
