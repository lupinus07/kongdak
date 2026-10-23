import { P } from "@/components/report";
import type { Saju } from "@/lib/saju";
import { sajuReading } from "@/lib/saju-reading";

/**
 * CHAPTER 1 사주 원국 아래 풀이 카드(만세력 규칙 풀이, AI 아님).
 * 결제 전 무료 미리보기와 결제 후 결과가 같은 카드를 보여주도록 한 곳에서 그린다.
 */
export function SajuCards({ saju, situation, gender }: { saju: Saju; situation?: string; gender?: string }) {
  return (
    <>
      {sajuReading(saju, { situation, gender }).map((card) => (
        <div
          key={card.title}
          className={`mt-1 flex flex-col gap-1.5 rounded-[18px] p-3.5 ${card.highlight ? "bg-[#FFF0F5]" : "bg-[#FFF8FA]"}`}
        >
          <b className="font-title text-[15px] font-normal text-brand">{card.title}</b>
          <P>{card.body}</P>
        </div>
      ))}
    </>
  );
}
