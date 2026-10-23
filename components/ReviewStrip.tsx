import { Hearts } from "@/components/icons/Heart";
import { loadReviewSummary } from "@/lib/reviews";

const PRODUCT_LABEL = { compat: "둘의 궁합", love: "나의 연애운" } as const;

/** 메인 화면 궁합·연애운 카드 아래 후기 띠: 하트 평균 + 옆으로 넘겨 보는 최근 한 줄 후기. 후기가 없으면 그리지 않는다. */
export async function ReviewStrip() {
  const { count, average, items } = await loadReviewSummary();
  if (!count) return null;

  return (
    <section className="flex flex-col gap-2.5 rounded-[26px] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(194,37,92,0.08)]">
      <div className="flex items-center gap-2">
        <span className="font-title text-lg text-ink">콩닥 후기</span>
        <Hearts rating={average} size={16} />
        <b className="font-title text-base font-normal text-brand">{average.toFixed(1)}</b>
        <span className="text-[12.5px] text-ink-sub">· 구매 인증 {count.toLocaleString()}개</span>
      </div>
      {items.length > 0 && (
        <ul className="-mx-4 m-0 flex list-none snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((r) => (
            <li key={r.id} className="flex w-[230px] shrink-0 snap-start flex-col gap-1.5 rounded-[18px] bg-bg p-3.5">
              <Hearts rating={r.rating} size={13} />
              <p className="m-0 line-clamp-3 text-[13.5px] leading-[1.6] text-ink">{r.comment}</p>
              <span className="mt-auto text-[11.5px] text-ink-sub">
                {r.name} · {PRODUCT_LABEL[r.product]} · {r.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
