import Link from "next/link";
import { BUSINESS } from "@/lib/business";

/** 하단 사업자 정보. 눌러서 펼치는 방식이라 화면을 차지하지 않는다 (JS 없이 details로 동작). */
export function BusinessFooter() {
  const rows = [
    ["상호", BUSINESS.name],
    ["대표", BUSINESS.ceo],
    ["사업자등록번호", BUSINESS.registrationNumber],
    ["통신판매업 신고", BUSINESS.mailOrderNumber],
    ["주소", BUSINESS.address],
    ["전화", BUSINESS.phone],
    ["이메일", BUSINESS.email],
    ["호스팅 제공", BUSINESS.hosting],
  ].filter(([, v]) => v);

  return (
    <footer className="flex flex-col items-center gap-3 px-5 pb-5 pt-2 text-center">
      <details className="group w-full">
        <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1 rounded-[14px] border border-[#F3C6D6] bg-white px-3.5 py-2 text-[13px] text-ink-sub [&::-webkit-details-marker]:hidden">
          {BUSINESS.name} 사업자 정보
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="transition-transform group-open:rotate-180">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <dl className="m-0 mt-2.5 flex flex-col gap-1 rounded-[18px] bg-white px-4 py-3 text-left text-xs leading-relaxed text-ink-sub">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0 text-ink-mute">{k}</dt>
              <dd className="m-0 break-all">
                {k === "이메일" ? <a href={`mailto:${v}`} className="text-ink-sub">{v}</a> : v}
              </dd>
            </div>
          ))}
        </dl>
      </details>
      <nav className="flex gap-3.5 text-xs text-ink-sub">
        <Link href="/terms" className="text-ink-sub no-underline">이용약관</Link>
        <Link href="/privacy" className="font-bold text-ink no-underline">개인정보처리방침</Link>
        {BUSINESS.email && (
          <a href={`mailto:${BUSINESS.email}`} className="text-ink-sub no-underline">문의하기</a>
        )}
      </nav>
      <p className="m-0 text-[11px] text-ink-mute">© 콩닥 by {BUSINESS.name}</p>
    </footer>
  );
}
