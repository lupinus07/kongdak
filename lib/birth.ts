/** 12시진. 경계가 :30이다. (결 서비스와 같은 구분) */
export const SHIJIN = [
  { name: "자시", hanja: "子", range: "23:30~01:29" },
  { name: "축시", hanja: "丑", range: "01:30~03:29" },
  { name: "인시", hanja: "寅", range: "03:30~05:29" },
  { name: "묘시", hanja: "卯", range: "05:30~07:29" },
  { name: "진시", hanja: "辰", range: "07:30~09:29" },
  { name: "사시", hanja: "巳", range: "09:30~11:29" },
  { name: "오시", hanja: "午", range: "11:30~13:29" },
  { name: "미시", hanja: "未", range: "13:30~15:29" },
  { name: "신시", hanja: "申", range: "15:30~17:29" },
  { name: "유시", hanja: "酉", range: "17:30~19:29" },
  { name: "술시", hanja: "戌", range: "19:30~21:29" },
  { name: "해시", hanja: "亥", range: "21:30~23:29" },
] as const;

/** 숫자만 남기고 YYYY.MM.DD 모양으로 점을 넣어 준다. */
export function formatBirthDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
}

/** 결과 화면 상단용: "1988년 12월 7일 자시 (양력)". 시간을 모르면 시진을 뺀다. */
export function birthLabel(birth: string, calendar = "양력", time = ""): string {
  const [y, m, d] = birth.split(".").map(Number);
  const shijin = time !== "" ? SHIJIN[Number(time)]?.name : undefined;
  return `${y}년 ${m}월 ${d}일${shijin ? ` ${shijin}` : ""} (${calendar})`;
}

/** 8자리가 다 입력됐을 때만 판단한다. 비어 있거나 입력 중이면 "pending". */
export function checkBirthDate(value: string): "pending" | "ok" | "invalid" {
  const m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
  if (!m) return "pending";
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || y > new Date().getFullYear()) return "invalid";
  const date = new Date(y, mo - 1, d);
  const real = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
  return real && date.getTime() <= Date.now() ? "ok" : "invalid";
}
