export function Heart({ size = 26, fill = "#FF6B9A" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill={fill} />
    </svg>
  );
}

/** 별점 대신 쓰는 하트 5개 (읽기 전용) */
export function Hearts({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`하트 5개 중 ${rating}개`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Heart key={n} size={size} fill={n <= Math.round(rating) ? "#FF6B9A" : "#F3C6D6"} />
      ))}
    </span>
  );
}
