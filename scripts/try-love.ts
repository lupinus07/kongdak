/**
 * 결제 없이 AI 풀이만 시험해 보는 스크립트. 실제로 API를 호출하니 크레딧이 소모된다.
 *
 *   npx tsx --env-file=.env.local scripts/try-love.ts [상황] [성별] [생년월일] [시진] [모델] [고민]
 *   npx tsx --env-file=.env.local scripts/try-love.ts 솔로 여자 1988.12.07 0 claude-opus-5-5 "소개팅을 받아볼까요?"
 */
import { writeFileSync } from "node:fs";
import { generateLoveReading, LOVE_MODEL } from "../lib/love-reading";
import { buildLoveFacts } from "../lib/saju-facts";

const [situation = "솔로", gender = "여자", birth = "1988.12.07", time = "0", model = LOVE_MODEL, worry] = process.argv.slice(2);

// 단가는 Anthropic 가격표 기준(100만 토큰당 달러). 모델을 바꾸면 아래 표도 맞춰야 한다.
const PRICE: Record<string, [number, number]> = { "claude-sonnet-5-5": [2, 10], "claude-opus-5-5": [4, 20] };

const facts = buildLoveFacts({ birth, calendar: "양력", time, situation, gender, worry });
const started = Date.now();
const { reading, usage } = await generateLoveReading(facts, model);
const sec = ((Date.now() - started) / 1000).toFixed(1);

const out = `${process.env.TEMP ?? "."}/love-${situation}-${model}.json`;
writeFileSync(out, JSON.stringify({ facts, reading }, null, 2), "utf8");

console.log(JSON.stringify(reading, null, 2));
const [pin, pout] = PRICE[model] ?? [0, 0];
const usd = (usage.input_tokens * pin + usage.output_tokens * pout) / 1_000_000;
console.log(
  `\n--- ${model} · ${situation} · ${sec}초 · 입력 ${usage.input_tokens} / 출력 ${usage.output_tokens} 토큰 · 약 $${usd.toFixed(3)} (약 ${Math.round(usd * 1400)}원, 환율 1,400원 가정)`,
);
console.log(`전체 결과 저장: ${out}`);
