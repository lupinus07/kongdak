import type { CSSProperties, ReactNode } from "react";

/** 풀이 결과 화면(샘플·유료 결과)에서 공통으로 쓰는 조각들 */

export function Sec({
  children,
  className = "bg-white",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={`flex flex-col gap-2.5 rounded-[26px] px-[18px] py-5 ${className}`} style={style}>
      {children}
    </section>
  );
}

export function Chap({ children, className = "text-[#A61E4D]" }: { children: ReactNode; className?: string }) {
  return <span className={`text-xs tracking-[0.5px] ${className}`}>{children}</span>;
}

export function H({ children, className = "text-ink" }: { children: ReactNode; className?: string }) {
  return <h2 className={`m-0 font-title text-[21px] font-normal leading-[1.35] ${className}`}>{children}</h2>;
}

export function P({ children, className = "text-[#5E3F4C]" }: { children: ReactNode; className?: string }) {
  return <p className={`m-0 text-[14.5px] leading-[1.75] ${className}`}>{children}</p>;
}

export function Li({ children, dot = "#FF6B9A" }: { children: ReactNode; dot?: string }) {
  return (
    <div className="flex items-start gap-2.5 text-[14.5px] leading-[1.7] text-[#5E3F4C]">
      <span className="mt-[9px] size-2 shrink-0 rounded-full" style={{ background: dot }} />
      <span>{children}</span>
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="m-0 text-center text-[11.5px] leading-relaxed text-[#8C6A78]">{children}</p>;
}

/** 풀이 본문이 들어올 자리를 보여주는 회색 줄. AI 풀이를 붙이기 전까지 레이아웃 확인용으로 쓴다. */
export function Skeleton({ lines = 3, tone = "#F6DCE5" }: { lines?: number; tone?: string }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-3.5 rounded-md" style={{ background: tone, width: i === lines - 1 ? "62%" : "100%" }} />
      ))}
    </div>
  );
}
