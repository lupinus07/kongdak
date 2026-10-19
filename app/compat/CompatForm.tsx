"use client";

import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import { BirthDateInput, BirthTimeSelect } from "@/components/BirthFields";
import { BenefitBox, BottomCta, ChipGroup, labelCls } from "@/components/form";
import type { OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";

const relations = ["썸 타는 중", "연애 중", "짝사랑"] as const;
const genders = ["여자", "남자"] as const;

export function CompatForm() {
  const [relation, setRelation] = useState<(typeof relations)[number]>("썸 타는 중");
  const [meGender, setMeGender] = useState<(typeof genders)[number]>("여자");
  const [meBirth, setMeBirth] = useState("");
  const [meTime, setMeTime] = useState("");
  const [youBirth, setYouBirth] = useState("");
  const [youTime, setYouTime] = useState("");
  const [youGender, setYouGender] = useState<(typeof genders)[number]>("남자");

  const draft: OrderDraft = {
    product: "compat",
    relation,
    me: { birth: meBirth, time: meTime, gender: meGender },
    you: { birth: youBirth, time: youTime, gender: youGender },
  };

  return (
    <>
      <BenefitBox items={PRODUCTS.compat.benefits} />

      <span className={`${labelCls} -mb-1.5`}>지금 우리 사이는?</span>
      <ChipGroup options={relations} value={relation} onChange={setRelation} />

      <div className="flex flex-col gap-2.5 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <label htmlFor="me-b" className={labelCls}>
          나
        </label>
        <div className="flex flex-col gap-2">
          <BirthDateInput id="me-b" value={meBirth} onChange={setMeBirth} placeholder="2001.05.20" />
          <BirthTimeSelect label="나의 태어난 시간" value={meTime} onChange={setMeTime} />
        </div>
        <Segmented label="나의 성별" options={genders} value={meGender} onChange={setMeGender} />

        <div className="my-0.5 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-[#F8D4E1]" />
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#FFC2D7" />
          </svg>
          <div className="h-px flex-1 bg-[#F8D4E1]" />
        </div>

        <label htmlFor="you-b" className={labelCls}>
          그 사람
        </label>
        <div className="flex flex-col gap-2">
          <BirthDateInput id="you-b" value={youBirth} onChange={setYouBirth} placeholder="2000.11.03" />
          <BirthTimeSelect label="그 사람의 태어난 시간" value={youTime} onChange={setYouTime} />
        </div>
        <Segmented label="그 사람의 성별" options={genders} value={youGender} onChange={setYouGender} />
      </div>

      <BottomCta sampleHref="/compat/sample" sampleLabel="샘플 궁합 먼저 보기 ›" product="compat" draft={draft} payLabel="우리 궁합 보기" />
    </>
  );
}
