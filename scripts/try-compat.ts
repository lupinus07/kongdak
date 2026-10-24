/**
 * 결제 없이 궁합 AI 풀이만 시험해 보는 스크립트. 실제로 API를 호출하니 크레딧이 소모된다.
 *
 *   npx tsx --env-file=.env.local scripts/try-compat.ts [관계] [나 생년월일] [나 시진] [나 성별] [상대 생년월일] [상대 시진] [상대 성별]
 *   npx tsx --env-file=.env.local scripts/try-compat.ts 부부 1988.03.15 0 여자 1988.06.15 8 남자
 * 시진은 0(자시)~11(해시), 모르면 "" 로 넣는다.
 */
import { writeFileSync } from "node:fs";
import { compatLabels } from "../lib/compat-reading-server";
import { COMPAT_MODEL, generateCompatReading } from "../lib/compat-reading";
import { buildCompatFacts } from "../lib/saju-facts";

const [relation = "연애 중", aBirth = "1988.03.15", aTime = "0", aGender = "여자", bBirth = "1988.06.15", bTime = "8", bGender = "남자"] =
  process.argv.slice(2);
const [la, lb] = compatLabels(relation, aGender, bGender);
const facts = buildCompatFacts(
  { birth: aBirth, calendar: "양력", time: aTime, gender: aGender, label: la },
  { birth: bBirth, calendar: "양력", time: bTime, gender: bGender, label: lb },
  relation,
);
const started = Date.now();
const { reading, usage } = await generateCompatReading(facts);
const sec = ((Date.now() - started) / 1000).toFixed(1);

const out = `${process.env.TEMP ?? "."}/compat-${relation}-${COMPAT_MODEL}.json`;
writeFileSync(out, JSON.stringify({ facts, reading }, null, 2), "utf8");
console.log(JSON.stringify(reading, null, 2));
console.log(`\n--- ${COMPAT_MODEL} · ${relation} · 콩닥지수 ${facts.score} · ${sec}초 · 입력 ${usage.input_tokens} / 출력 ${usage.output_tokens} 토큰`);
console.log(`전체 결과 저장: ${out}`);
