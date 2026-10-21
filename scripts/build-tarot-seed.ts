/**
 * 타로 풀이 원본(scripts/tarot-data)을 검사하고 Supabase에 넣을 SQL을 만든다.
 *
 *   npx tsx scripts/build-tarot-seed.ts
 *
 * 결과: design/tarot_seed.sql (tarot_cards 78행 + tarot_interpretations 780행).
 * Supabase SQL Editor에서 kongdak_schema.sql 다음에 실행한다. 여러 번 실행해도 덮어쓰기만 한다.
 */
import { writeFileSync } from "node:fs";
import { TAROT_CARDS } from "../lib/tarot-cards";
import { TAROT_TOPICS } from "../lib/tarot";
import { CUPS } from "./tarot-data/cups";
import { MAJOR } from "./tarot-data/major";
import { PENTACLES } from "./tarot-data/pentacles";
import { SWORDS } from "./tarot-data/swords";
import type { CardData, Reading, TopicCode } from "./tarot-data/types";
import { WANDS } from "./tarot-data/wands";

const ALL: CardData[] = [...MAJOR, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES].sort((a, b) => a.id - b.id);
const TOPICS = TAROT_TOPICS.map((t) => t.id) as TopicCode[];
const SUITS = ["wands", "cups", "swords", "pentacles"] as const;

/** CLAUDE.md 풀이 말투: 단정하거나 겁주는 표현 금지, "Rider-Waite" 상표 금지 */
const BANNED = ["꼭 헤어", "절대", "반드시", "인연이 없", "운이 나쁘", "불행", "저주", "Rider", "라이더"];

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

if (ALL.length !== 78) fail(`카드 수가 78장이 아니에요: ${ALL.length}`);
ALL.forEach((c, i) => c.id !== i && fail(`카드 id가 비었거나 겹쳐요: ${i}번 자리에 ${c.id}`));

function checkText(where: string, text: string) {
  if (!text?.trim()) return fail(`${where}: 비어 있어요`);
  for (const w of BANNED) if (text.includes(w)) fail(`${where}: 금지 표현 "${w}"`);
}

for (const c of ALL) {
  c.kw.forEach((k, r) => {
    if (k.length !== 3) fail(`${c.id} 키워드(${r ? "역" : "정"})가 3개가 아니에요`);
    k.forEach((w) => checkText(`${c.id} 키워드`, w));
  });
  c.m.forEach((m, r) => checkText(`${c.id} 의미(${r ? "역" : "정"})`, m));
  for (const topic of TOPICS) {
    const pair = c.t[topic];
    if (!pair || pair.length !== 2) {
      fail(`${c.id} ${topic}: 정/역 풀이 2개가 필요해요`);
      continue;
    }
    pair.forEach((reading: Reading, r) => {
      const where = `${c.id} ${topic} ${r ? "역" : "정"}`;
      if (reading.length !== 3) return fail(`${where}: [제목, 풀이, 한마디] 3개가 필요해요`);
      reading.forEach((s, i) => checkText(`${where} ${["제목", "풀이", "한마디"][i]}`, s));
      if (reading[0].length > 18) fail(`${where}: 제목이 18자를 넘어요 (${reading[0]})`);
    });
  }
  if (Object.keys(c.t).length !== TOPICS.length) fail(`${c.id}: 고민 카테고리가 ${TOPICS.length}개가 아니에요`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const q = (s: string) => `'${s.replaceAll("'", "''")}'`;
const arr = (a: string[]) => `array[${a.map(q).join(", ")}]`;

const cardRows = ALL.map((c) => {
  const info = TAROT_CARDS[c.id];
  const major = c.id < 22;
  const suit = major ? "null" : q(SUITS[Math.floor((c.id - 22) / 14)]);
  const number = major ? c.id : ((c.id - 22) % 14) + 1;
  const image = `/tarot/${String(c.id).padStart(2, "0")}.webp`;
  return `  (${c.id}, ${q(major ? "major" : "minor")}, ${suit}, ${number}, ${q(info.en)}, ${q(info.ko)}, ${q(image)}, ${arr(c.kw[0])}, ${arr(c.kw[1])}, ${q(c.m[0])}, ${q(c.m[1])})`;
});

const readingRows = ALL.flatMap((c) =>
  TOPICS.flatMap((topic) =>
    c.t[topic].map(
      ([headline, message, advice], r) =>
        `  (${c.id}, ${q(topic)}, ${r === 1}, ${q(headline)}, ${q(message)}, ${q(advice)})`,
    ),
  ),
);

const sql = `-- 콩닥 타로 데이터: 카드 78장 + 풀이 780개 (카드 78 × 정/역 2 × 고민 5)
-- scripts/build-tarot-seed.ts로 만든 파일이에요. 직접 고치지 말고 scripts/tarot-data를 고친 뒤 다시 만들어요.
-- 이미지는 Storage가 아니라 앱의 public/tarot에서 제공해요 (image_path = 사이트 경로).

begin;

insert into public.tarot_cards
  (id, arcana, suit, number, name_en, name_ko, image_path, keywords_up, keywords_rev, meaning_up, meaning_rev)
values
${cardRows.join(",\n")}
on conflict (id) do update set
  arcana = excluded.arcana, suit = excluded.suit, number = excluded.number,
  name_en = excluded.name_en, name_ko = excluded.name_ko, image_path = excluded.image_path,
  keywords_up = excluded.keywords_up, keywords_rev = excluded.keywords_rev,
  meaning_up = excluded.meaning_up, meaning_rev = excluded.meaning_rev;

insert into public.tarot_interpretations
  (card_id, topic_code, is_reversed, headline, message, advice)
values
${readingRows.join(",\n")}
on conflict (card_id, topic_code, is_reversed) do update set
  headline = excluded.headline, message = excluded.message, advice = excluded.advice;

commit;
`;

writeFileSync("design/tarot_seed.sql", sql);
console.log(`design/tarot_seed.sql: 카드 ${cardRows.length}장, 풀이 ${readingRows.length}개`);
