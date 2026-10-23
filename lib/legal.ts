import { BUSINESS } from "./business";

/**
 * 이용약관·개인정보처리방침에 들어가는 값. 비어 있으면 화면에 "(확인 후 기재 예정)"으로 보인다.
 * 사업자 정보(상호·대표·연락처)는 lib/business.ts 값을 그대로 쓴다.
 */
export const LEGAL = {
  /** 시행일 (예: "2026년 11월 1일") */
  effectiveDate: "",
  /** Supabase 프로젝트 지역 (Supabase 대시보드 → Project Settings → General의 Region, 예: "대한민국(서울)") */
  supabaseRegion: "",
};

export const TBD = "(확인 후 기재 예정)";

export const or = (v: string) => v || TBD;

export const COMPANY = {
  name: BUSINESS.name,
  ceo: BUSINESS.ceo,
  email: or(BUSINESS.email),
  phone: or(BUSINESS.phone),
  address: or(BUSINESS.address),
};
