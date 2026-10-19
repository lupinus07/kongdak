"use client";

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
};

export function Segmented<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1 rounded-[14px] bg-bg p-1">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={`flex h-[38px] items-center justify-center rounded-[11px] text-sm ${
              on ? "bg-white font-title text-brand shadow-[0_2px_6px_rgba(194,37,92,0.12)]" : "text-ink-sub"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
