"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import { BirthDateInput, BirthTimeSelect } from "@/components/BirthFields";
import { BenefitBox, BottomCta, ChipGroup, inputCls, labelCls } from "@/components/form";
import { isDraftReady, saveOrderDraft, WORRY_MAX, type OrderDraft } from "@/lib/order-draft";
import { PRODUCTS } from "@/lib/products";

const situations = ["솔로", "썸", "연애 중", "이별 후"] as const;
const calendars = ["양력", "음력"] as const;
const genders = ["여자", "남자"] as const;

const worryExamples: Record<(typeof situations)[number], string> = {
  솔로: "예) 소개팅을 받아볼까 고민돼요. 올해 인연이 들어올까요?",
  썸: "예) 연락은 자주 하는데 고백은 안 해요. 제가 먼저 다가가도 될까요?",
  "연애 중": "예) 요즘 서운한 일이 자주 생겨요. 오래 만나려면 어떻게 하면 좋을까요?",
  "이별 후": "예) 헤어진 지 한 달인데 아직 생각나요. 마음을 어떻게 정리하면 좋을까요?",
};

export function LoveForm() {
  const router = useRouter();
  const [situation, setSituation] = useState<(typeof situations)[number]>("솔로");
  const [calendar, setCalendar] = useState<(typeof calendars)[number]>("양력");
  const [gender, setGender] = useState<(typeof genders)[number]>("여자");
  const [birth, setBirth] = useState("");
  const [time, setTime] = useState("");
  const [worry, setWorry] = useState("");

  const draft: OrderDraft = { product: "love", situation, calendar, birth, time, gender, worry: worry.trim() || undefined };

  function onPreview() {
    if (!isDraftReady(draft)) {
      alert("생년월일을 정확히 입력해 주세요.");
      return;
    }
    saveOrderDraft(draft);
    router.push("/love/preview");
  }

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
        <label htmlFor="worry" className={labelCls}>
          요즘 연애 고민 <span className="text-sm text-ink-sub">(선택)</span>
        </label>
        <textarea
          id="worry"
          rows={3}
          maxLength={WORRY_MAX}
          value={worry}
          onChange={(e) => setWorry(e.target.value)}
          placeholder={worryExamples[situation]}
          className={`${inputCls} h-auto resize-none py-3 leading-normal`}
        />
        <p className="m-0 -mt-1 flex justify-between gap-2 text-xs text-ink-sub">
          <span>적어 주면 내 고민에 맞춘 풀이를 함께 써 드려요. 이름·연락처는 적지 말아 주세요</span>
          <span className="shrink-0">
            {worry.length}/{WORRY_MAX}
          </span>
        </p>
      </div>

      <BottomCta
        sampleHref="/love/sample"
        sampleLabel="샘플 풀이 먼저 보기 ›"
        product="love"
        draft={draft}
        payLabel="내 연애운 보기"
        action={
          <button
            type="button"
            onClick={onPreview}
            className="flex h-[58px] w-full items-center justify-center rounded-[29px] bg-brand font-title text-[19px] text-white shadow-[0_10px_22px_rgba(194,37,92,0.28)]"
          >
            내 연애운 보기
          </button>
        }
      />
    </>
  );
}
