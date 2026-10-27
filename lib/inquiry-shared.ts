/** 1:1 문의 입력 규칙. 화면(입력란)과 서버(저장 전 검사)가 같이 쓴다. DB check 제약과 맞춘다. */
export const INQUIRY_CATEGORIES = ["환불", "결제", "풀이 오류", "기타"] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];
export const INQUIRY_MIN = 5;
export const INQUIRY_MAX = 1000;
export const ANSWER_MAX = 2000;
