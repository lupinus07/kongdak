import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "@/components/icons/Check";
import { PayButton } from "@/components/PayButton";
import type { OrderDraft } from "@/lib/order-draft";
import type { Product } from "@/lib/products";

export const inputCls =
  "h-[46px] w-full min-w-0 rounded-[14px] border-none bg-bg px-3.5 text-[15px] text-ink placeholder:text-[#B88A9C]";
export const labelCls = "font-title text-base text-brand";

export function BenefitBox({ items, title = "결과에서 이런 걸 알려드려요" }: { items: string[]; title?: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 rounded-2xl border-[1.5px] border-dashed border-[#F3B6CB] px-3.5 py-3">
      <span className="col-span-2 text-xs text-[#A61E4D]">{title}</span>
      {items.map((b) => (
        <span key={b} className="flex items-center gap-1.5 text-[13px] text-[#6B4A58]">
          <Check />
          {b}
        </span>
      ))}
    </div>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  gap = "gap-2",
  px = "px-4",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  gap?: string;
  px?: string;
}) {
  return (
    <div className={`flex ${gap}`}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`h-10 rounded-[20px] text-sm ${px} ${
            o === value ? "bg-brand text-white" : "border-[1.5px] border-[#F3B6CB] bg-white text-ink-sub"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function BottomCta({
  sampleHref,
  sampleLabel,
  product,
  draft,
  payLabel,
  sticky = false,
  action,
}: {
  sampleHref: string;
  sampleLabel: string;
  product: Product;
  draft: OrderDraft;
  payLabel: string;
  /** 있으면 990원 결제 버튼 대신 이 버튼을 보여 준다 (결제 전 무료 미리보기로 보내는 버튼 등) */
  action?: ReactNode;
  /** 스크롤해도 화면 아래에 붙어 있게 한다 */
  sticky?: boolean;
}) {
  return (
    <div
      className={`mt-auto flex flex-col items-center gap-2.5 ${
        sticky ? "sticky bottom-0 z-20 -mx-5 bg-gradient-to-t from-bg from-80% to-transparent px-5 pb-4 pt-5" : ""
      }`}
    >
      <Link href={sampleHref} className="p-1 text-sm text-brand">
        {sampleLabel}
      </Link>
      {action ?? <PayButton label={payLabel} product={product} draft={draft} />}
    </div>
  );
}
