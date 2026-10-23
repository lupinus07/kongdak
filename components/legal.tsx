import type { ReactNode } from "react";
import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";

/** 이용약관·개인정보처리방침 공통 레이아웃 */
export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <PhoneFrame>
      <BackHeader title={title} href="/" />
      <main className="flex flex-1 flex-col gap-3 px-[22px] pb-10 pt-2 text-[15px] leading-[1.75] text-[#5E3F4C]">
        <h1 className="m-0 font-title text-[26px] font-normal text-ink">{title}</h1>
        <div className="rounded-[20px] bg-white px-4 py-3.5">{intro}</div>
        {children}
      </main>
    </PhoneFrame>
  );
}

export function Article({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-[20px] bg-white px-4 py-3.5">
      <h2 className="m-0 font-title text-[17px] font-normal text-brand">{title}</h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="m-0">{children}</p>;
}

export function Ol({ items }: { items: ReactNode[] }) {
  return (
    <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ol>
  );
}

export function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** 표 대신 쓰는 항목 카드 (모바일에서 읽기 쉽게) */
export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="m-0 flex flex-col gap-1 rounded-[14px] bg-bg px-3 py-2.5 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="w-[78px] shrink-0 break-keep text-ink-mute">{k}</dt>
          <dd className="m-0 min-w-0 flex-1 break-keep">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
