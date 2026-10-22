/**
 * 콩닥 안에서 지나온 페이지(경로) 기록. 상단 '뒤로' 버튼이 이전 페이지로 갈지, 정해진 주소로 갈지 판단하는 데 쓴다.
 * 탭(세션)마다 따로 기억하고, 다른 사이트·카톡 링크로 바로 들어온 경우엔 기록이 한 칸뿐이라 정해진 주소로 간다.
 */

const KEY = "kongdak:nav-stack";

function read(): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(stack: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-50)));
  } catch {
    // 저장소를 못 쓰면 뒤로 버튼은 정해진 주소로 간다
  }
}

/** 경로가 바뀔 때마다 부른다. 바로 전 경로로 돌아온 거면 뒤로 간 것으로 보고 한 칸 뺀다. */
export function trackPath(path: string) {
  const stack = read();
  if (stack.at(-1) === path) return; // 새로고침
  if (stack.at(-2) === path) stack.pop();
  else stack.push(path);
  write(stack);
}

/** 결제 화면·결제창·로그인 처리로는 되돌아가지 않는다 (결제 후 결과에서 뒤로 가면 결제를 다시 보게 됨) */
const SKIP_BACK_TO = ["/payment", "/auth"];

/** 브라우저 '뒤로'로 갈 수 있는 콩닥 안의 이전 페이지가 있는지 */
export function canGoBackInApp(): boolean {
  const prev = read().at(-2);
  return !!prev && !SKIP_BACK_TO.some((p) => prev === p || prev.startsWith(p + "/"));
}
