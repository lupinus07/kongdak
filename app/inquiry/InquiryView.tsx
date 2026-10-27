import type { InquiryDetail } from "@/lib/inquiry-shared";

const date = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/** 문의 하나와 답변. 비밀번호를 맞혔거나 로그인한 본인일 때만 그린다. */
export function InquiryView({ q }: { q: InquiryDetail }) {
  return (
    <section className="flex flex-col gap-3 rounded-[26px] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-[#FFE3EC] px-2 py-[3px] font-title text-[13px] text-brand">{q.category}</span>
        <span className="text-[13px] text-ink-sub">
          {q.code} · {date(q.createdAt)}
        </span>
      </div>
      <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.7] text-ink">{q.content}</p>
      <div className="h-px bg-[#F8D4E1]" />
      {q.answer ? (
        <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#FFF8FA] p-3.5">
          <b className="font-title text-[15px] font-normal text-brand">콩닥 답변 · {date(q.answeredAt!)}</b>
          <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.7] text-[#5E3F4C]">{q.answer}</p>
        </div>
      ) : (
        <p className="m-0 text-center text-[14px] text-ink-sub">아직 답변을 준비하고 있어요. 조금만 기다려 주세요.</p>
      )}
    </section>
  );
}
