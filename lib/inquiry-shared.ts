/** 1:1 문의 입력 규칙. 화면(입력란)과 서버(저장 전 검사)가 같이 쓴다. DB check 제약과 맞춘다. */
export const INQUIRY_CATEGORIES = ["환불", "결제", "풀이 오류", "기타"] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];
export const INQUIRY_MIN = 5;
export const INQUIRY_MAX = 1000;
export const ANSWER_MAX = 2000;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 20;

/** 화면에 보여주는 문의 하나 (내용·답변 포함). 비밀번호를 맞혔거나 로그인한 본인일 때만 서버가 내려준다. */
export type InquiryDetail = {
  code: string;
  category: string;
  content: string;
  createdAt: string;
  answer: string | null;
  answeredAt: string | null;
};
