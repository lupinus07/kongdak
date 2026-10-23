"use client";

import { SHIJIN, checkBirthDate, formatBirthDate } from "@/lib/birth";
import { inputCls } from "@/components/form";

export function BirthDateInput({
  id,
  value,
  onChange,
  placeholder,
  label,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  const bad = checkBirthDate(value) === "invalid";
  return (
    <div className="min-w-0">
      <input
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(formatBirthDate(e.target.value))}
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder={placeholder}
        aria-invalid={bad}
        className={`${inputCls} ${bad ? "ring-2 ring-[#E03131]" : ""}`}
      />
      {bad && <p className="m-0 mt-1 text-xs text-[#E03131]">날짜를 다시 확인해 주세요</p>}
    </div>
  );
}

export function BirthTimeSelect({
  id,
  value,
  onChange,
  label,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} ${value === "" ? "text-[#9A7C8A]" : ""}`}
    >
      <option value="">모름</option>
      {SHIJIN.map((t, i) => (
        <option key={t.name} value={i}>
          {t.name} ({t.hanja}) {t.range}
        </option>
      ))}
    </select>
  );
}
