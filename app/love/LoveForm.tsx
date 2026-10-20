"use client";

import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import { BirthDateInput, BirthTimeSelect } from "@/components/BirthFields";
import { BenefitBox, BottomCta, ChipGroup, labelCls } from "@/components/form";
import type { OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";
import { SajuPreview } from "./SajuPreview";

const situations = ["솔로", "썸", "연애 중", "이별 후"] as const;
const calendars = ["양력", "음력"] as const;
const genders = ["여자", "남자"] as const;

export function LoveForm() {
  const [situation, setSituation] = useState<(typeof situations)[number]>("솔로");
  const [calendar, setCalendar] = useState<(typeof calendars)[number]>("양력");
  const [gender, setGender] = useState<(typeof genders)[number]>("여자");
  const [birth, setBirth] = useState("");
  const [time, setTime] = useState("");

  const draft: OrderDraft = { product: "love", situation, calendar, birth, time, gender };

  return (
    <>
      <span className={`${labelCls} -mb-1.5`}>지금 내 상황은?</span>
      <ChipGroup options={situations} value={situation} onChange={setSituation} gap="gap-1.5" px="px-[15px]" />

      <BenefitBox items={PRODUCTS.love.benefits} />

      <div className="flex flex-col gap-2.5 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(194,37,92,0.10)]">
        <label htmlFor="birth" className={labelCls}>
          생년월일
        </label>
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
          <BirthDateInput id="birth" value={birth} onChange={setBirth} placeholder="2001.05.20" />
          <Segmented label="양력 음력" options={calendars} value={calendar} onChange={setCalendar} />
        </div>
        <label htmlFor="btime" className={labelCls}>
          태어난 시간
        </label>
        <BirthTimeSelect id="btime" value={time} onChange={setTime} />
        <p className="m-0 -mt-1 text-xs text-ink-sub">
          {time === ""
            ? "시간을 모르면 사주가 6글자(3기둥)로 풀이돼요. 알면 더 자세히 볼 수 있어요"
            : "시간까지 넣으면 사주 8글자(4기둥)로 풀이해요"}
        </p>
        <span className={labelCls}>성별</span>
        <Segmented label="성별" options={genders} value={gender} onChange={setGender} />
      </div>

      <SajuPreview birth={birth} calendar={calendar} time={time} situation={situation} gender={gender} />

      <BottomCta sampleHref="/love/sample" sampleLabel="샘플 풀이 먼저 보기 ›" product="love" draft={draft} payLabel="내 연애운 보기" />
    </>
  );
}
